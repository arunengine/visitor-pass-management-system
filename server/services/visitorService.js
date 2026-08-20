/**
 * Visitor Service
 * Purpose: Implements business logic for Visitor registration, search, filtering,
 * pagination, cancellation, and enforcing the 5 core business rules.
 */

const Visitor = require('../models/visitorModel');
const Employee = require('../models/employeeModel');
const logActivity = require('../utils/activityLogger');
const settingsService = require('./settingsService');

/**
 * Process all active visitors across the system that have passed their meetingExpiryTime.
 * Idempotent: safe to run repeatedly.
 */
const processExpiredVisitors = async () => {
  try {
    const now = new Date();
    const expiredVisitors = await Visitor.find({
      status: { $in: ['APPROVED', 'CHECKED_IN'] },
      meetingExpiryTime: { $ne: null, $lte: now },
    });

    for (const visitor of expiredVisitors) {
      if (visitor.status === 'CHECKED_OUT') continue;

      visitor.status = 'CHECKED_OUT';
      if (!visitor.checkOutTime) {
        visitor.checkOutTime = visitor.meetingExpiryTime || now;
      }
      await visitor.save();

      await logActivity({
        action: 'VISITOR_CHECKED_OUT',
        visitorId: visitor._id,
        userId: visitor.approvedBy || visitor.createdBy,
        role: 'SYSTEM',
        remarks: 'Visitor automatically checked out after meeting duration expired.',
      });
    }
  } catch (error) {
    console.error('[Process Expired Visitors Error]:', error.message);
  }
};

/**
 * Check and process automatic checkout for a single visitor if expired.
 */
const checkAndProcessExpiredVisitor = async (visitor) => {
  if (!visitor) return false;
  const activeStatuses = ['APPROVED', 'CHECKED_IN'];
  if (!activeStatuses.includes(visitor.status)) return false;
  if (!visitor.meetingExpiryTime) return false;

  const now = new Date();
  if (now >= new Date(visitor.meetingExpiryTime)) {
    visitor.status = 'CHECKED_OUT';
    if (!visitor.checkOutTime) {
      visitor.checkOutTime = visitor.meetingExpiryTime || now;
    }
    await visitor.save();

    await logActivity({
      action: 'VISITOR_CHECKED_OUT',
      visitorId: visitor._id,
      userId: visitor.approvedBy || visitor.createdBy,
      role: 'SYSTEM',
      remarks: 'Visitor automatically checked out after meeting duration expired.',
    });

    return true;
  }
  return false;
};

/**
 * Get all visitors with search, filter, and pagination.
 */
const getAllVisitors = async (query) => {
  await processExpiredVisitors();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Search by Visitor Name, Phone, or Visitor ID
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { visitorId: searchRegex },
      { company: searchRegex },
    ];
  }

  // Filter by Visit Date
  if (query.visitDate) {
    const targetDate = new Date(query.visitDate);
    const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    const endDate = new Date(targetDate.setHours(23, 59, 59, 999));
    filter.visitDate = { $gte: startDate, $lte: endDate };
  }

  // Filter by Host Employee
  if (query.employeeId && query.employeeId !== 'ALL') {
    filter.employee = query.employeeId;
  }

  // Filter by Status
  if (query.status && query.status !== 'ALL') {
    filter.status = query.status;
  }

  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get single visitor by ID.
 */
const getVisitorById = async (id) => {
  let visitor = await Visitor.findById(id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role');
  if (!visitor) {
    const error = new Error('Visitor record not found');
    error.statusCode = 404;
    throw error;
  }

  const wasUpdated = await checkAndProcessExpiredVisitor(visitor);
  if (wasUpdated) {
    visitor = await Visitor.findById(id)
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .populate('createdBy', 'name email role');
  }

  return visitor;
};

/**
 * Register a new visitor & enforce Business Rules 1 - 5.
 */
const createVisitor = async (visitorData, userId) => {
  await processExpiredVisitors();

  const {
    fullName,
    phone,
    email,
    company,
    address,
    photo,
    idProofType,
    idProofNumber,
    employeeId,
    purposeOfVisit,
    visitDate,
    expectedArrivalTime,
    remarks,
  } = visitorData;

  // Receptionist Registration: Visitors are registered without host employee assignment
  // Host employee allocation must take place on the Visitor Allocation page.
  const hostEmployeeId = null;

  // Parse & Validate Dates
  const inputDate = new Date(visitDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDateOnly = new Date(inputDate);
  inputDateOnly.setHours(0, 0, 0, 0);

  // --- Rule 3: Visit date cannot be earlier than today ---
  if (inputDateOnly < today) {
    const error = new Error('Visit date cannot be earlier than today');
    error.statusCode = 400;
    throw error;
  }

  // --- Rule 4: If visit date is today, expected arrival time cannot be earlier than current time ---
  const isToday = inputDateOnly.getTime() === today.getTime();
  if (isToday && expectedArrivalTime) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    const [arrHours, arrMinutes] = expectedArrivalTime.split(':').map(Number);
    if (!isNaN(arrHours) && !isNaN(arrMinutes)) {
      const arrivalTotalMinutes = arrHours * 60 + arrMinutes;
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      if (arrivalTotalMinutes < currentTotalMinutes) {
        const error = new Error('Expected arrival time cannot be earlier than the current time for today\'s visit');
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // --- Rule 1: A visitor cannot have more than one ACTIVE visit ---
  // Active visit statuses: PENDING, APPROVED, CHECKED_IN
  const activeStatuses = ['PENDING', 'APPROVED', 'CHECKED_IN'];
  const activeVisit = await Visitor.findOne({
    phone: phone.trim(),
    status: { $in: activeStatuses },
  });
  if (activeVisit) {
    const error = new Error(`Visitor with phone ${phone} already has an active visit (${activeVisit.visitorId} - ${activeVisit.status})`);
    error.statusCode = 400;
    throw error;
  }

  // --- Rule 2: Duplicate visitor registration on the same date is not allowed ---
  const startOfDay = new Date(inputDateOnly);
  const endOfDay = new Date(inputDateOnly);
  endOfDay.setHours(23, 59, 59, 999);

  const duplicateVisit = await Visitor.findOne({
    phone: phone.trim(),
    visitDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'CANCELLED' },
  });
  if (duplicateVisit) {
    const error = new Error(`Visitor with phone ${phone} is already registered for a visit on ${inputDateOnly.toISOString().split('T')[0]}`);
    error.statusCode = 400;
    throw error;
  }

  // Create new Visitor record with default status PENDING
  const newVisitor = new Visitor({
    fullName,
    phone: phone.trim(),
    email: email ? email.toLowerCase() : '',
    company,
    address,
    photo,
    idProofType,
    idProofNumber,
    employee: hostEmployeeId,
    purposeOfVisit,
    visitDate: inputDateOnly,
    expectedArrivalTime,
    status: 'PENDING', // Default status: PENDING
    remarks,
    createdBy: userId,
  });

  await newVisitor.save();

  await logActivity({
    action: 'VISITOR_CREATED',
    visitorId: newVisitor._id,
    userId,
    role: 'USER',
    remarks: 'Registered new visitor',
  });

  return await Visitor.findById(newVisitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role');
};

/**
 * Update visitor registration details.
 */
const updateVisitor = async (id, updateData) => {
  const visitor = await Visitor.findById(id);
  if (!visitor) {
    const error = new Error('Visitor record not found');
    error.statusCode = 404;
    throw error;
  }

  if (visitor.status === 'CANCELLED' || visitor.status === 'CHECKED_OUT') {
    const error = new Error(`Cannot modify a visitor with status ${visitor.status}`);
    error.statusCode = 400;
    throw error;
  }

  // If host employee is updated, verify employee is active
  if (updateData.employeeId) {
    const hostEmployee = await Employee.findOne({ _id: updateData.employeeId, isDeleted: false });
    if (!hostEmployee || hostEmployee.status === 'Inactive') {
      const error = new Error('Selected host employee is Inactive or invalid');
      error.statusCode = 400;
      throw error;
    }
    visitor.employee = hostEmployee._id;
  }

  if (updateData.fullName) visitor.fullName = updateData.fullName;
  if (updateData.phone) visitor.phone = updateData.phone;
  if (updateData.email !== undefined) visitor.email = updateData.email;
  if (updateData.company) visitor.company = updateData.company;
  if (updateData.address !== undefined) visitor.address = updateData.address;
  if (updateData.idProofType) visitor.idProofType = updateData.idProofType;
  if (updateData.idProofNumber) visitor.idProofNumber = updateData.idProofNumber;
  if (updateData.purposeOfVisit) visitor.purposeOfVisit = updateData.purposeOfVisit;
  if (updateData.visitDate) visitor.visitDate = new Date(updateData.visitDate);
  if (updateData.expectedArrivalTime) visitor.expectedArrivalTime = updateData.expectedArrivalTime;
  if (updateData.remarks !== undefined) visitor.remarks = updateData.remarks;

  await visitor.save();

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role');
};

/**
 * Cancel a visitor registration.
 */
const cancelVisitor = async (id) => {
  const visitor = await Visitor.findById(id);
  if (!visitor) {
    const error = new Error('Visitor record not found');
    error.statusCode = 404;
    throw error;
  }

  if (visitor.status === 'CANCELLED') {
    const error = new Error('Visitor registration is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  visitor.status = 'CANCELLED';
  await visitor.save();

  await logActivity({
    action: 'VISITOR_CANCELLED',
    visitorId: visitor._id,
    userId: visitor.createdBy,
    role: 'USER',
    remarks: 'Visitor registration cancelled',
  });

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role');
};

/**
 * Get visitor requests assigned to the logged-in employee filtered by status (PENDING, APPROVED, REJECTED).
 */
const getMyVisitorRequests = async (user, status, query) => {
  await processExpiredVisitors();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { status };

  // If role is EMPLOYEE, restrict query to visitors assigned to this employee's linked record
  if (user.role === 'EMPLOYEE') {
    let employeeId = user.employee;
    if (!employeeId && user.email) {
      const empDoc = await Employee.findOne({ email: user.email });
      if (empDoc) employeeId = empDoc._id;
    }

    if (!employeeId) {
      return { visitors: [], pagination: { total: 0, page, limit, totalPages: 1 } };
    }
    filter.employee = employeeId;
  }

  // Search by Visitor Name, Phone, or Visitor ID
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { visitorId: searchRegex },
      { company: searchRegex },
    ];
  }

  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Approve a visitor request (PENDING -> APPROVED).
 */
const approveVisitorRequest = async (id, user, remarks = '') => {
  const visitor = await Visitor.findById(id);
  if (!visitor) {
    const error = new Error('Visitor request not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization Check: Only assigned employee or Admin can approve
  let userEmpId = user.employee;
  if (!userEmpId && user.email) {
    const empDoc = await Employee.findOne({ email: user.email });
    if (empDoc) userEmpId = empDoc._id;
  }

  if (user.role === 'EMPLOYEE' && String(visitor.employee) !== String(userEmpId)) {
    const error = new Error('Forbidden: You can only approve visitor requests assigned to you');
    error.statusCode = 403;
    throw error;
  }

  // Idempotency Check: Approved requests cannot be approved again
  if (visitor.status === 'APPROVED') {
    const error = new Error('Visitor request is already APPROVED');
    error.statusCode = 400;
    throw error;
  }

  if (visitor.status === 'REJECTED') {
    const error = new Error('Cannot approve a REJECTED visitor request');
    error.statusCode = 400;
    throw error;
  }

  // Fetch configured default meeting duration from Settings
  const settings = await settingsService.getSettings();
  const duration = settings.defaultMeetingDuration || 30;

  const now = new Date();
  const expiryTime = new Date(now.getTime() + duration * 60 * 1000);

  visitor.status = 'APPROVED';
  visitor.approvedBy = user.id;
  visitor.approvedAt = now;
  visitor.meetingStartTime = now;
  visitor.meetingDuration = duration;
  visitor.meetingExpiryTime = expiryTime;
  if (remarks) visitor.approvalRemarks = remarks;

  await visitor.save();

  await logActivity({
    action: 'VISITOR_APPROVED',
    visitorId: visitor._id,
    userId: user.id,
    role: user.role,
    remarks: remarks || 'Request approved by host',
  });

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role')
    .populate('approvedBy', 'name email role');
};

/**
 * Reject a visitor request (PENDING -> REJECTED).
 */
const rejectVisitorRequest = async (id, user, remarks = '') => {
  const visitor = await Visitor.findById(id);
  if (!visitor) {
    const error = new Error('Visitor request not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization Check: Only assigned employee or Admin can reject
  let userEmpId = user.employee;
  if (!userEmpId && user.email) {
    const empDoc = await Employee.findOne({ email: user.email });
    if (empDoc) userEmpId = empDoc._id;
  }

  if (user.role === 'EMPLOYEE' && String(visitor.employee) !== String(userEmpId)) {
    const error = new Error('Forbidden: You can only reject visitor requests assigned to you');
    error.statusCode = 403;
    throw error;
  }

  // Idempotency Check: Rejected requests cannot be rejected again
  if (visitor.status === 'REJECTED') {
    const error = new Error('Visitor request is already REJECTED');
    error.statusCode = 400;
    throw error;
  }

  if (visitor.status === 'APPROVED') {
    const error = new Error('Cannot reject an APPROVED visitor request');
    error.statusCode = 400;
    throw error;
  }

  visitor.status = 'REJECTED';
  visitor.approvedBy = user.id;
  visitor.approvedAt = new Date();
  if (remarks) visitor.approvalRemarks = remarks;

  await visitor.save();

  await logActivity({
    action: 'VISITOR_REJECTED',
    visitorId: visitor._id,
    userId: user.id,
    role: user.role,
    remarks: remarks || 'Request declined by host',
  });

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role')
    .populate('approvedBy', 'name email role');
};

/**
 * Check In a visitor (APPROVED -> CHECKED_IN).
 * Enforces Rule 6 (Only after approval), Rule 7 (No re-check-in), Rule 9 (No rejected), Rule 10 (No cancelled).
 */
const checkInVisitor = async (id, userId) => {
  const visitor = await Visitor.findById(id);
  if (!visitor) {
    const error = new Error('Visitor record not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify if meeting duration has expired
  await checkAndProcessExpiredVisitor(visitor);

  if (visitor.status === 'CHECKED_OUT') {
    const error = new Error('Meeting duration has expired. Visitor has been automatically checked out.');
    error.statusCode = 400;
    throw error;
  }

  // Rule 7: Already checked-in visitors cannot check in again
  if (visitor.status === 'CHECKED_IN') {
    const error = new Error('Visitor is already checked in');
    error.statusCode = 400;
    throw error;
  }

  // Rule 9: Rejected visitors cannot be checked in
  if (visitor.status === 'REJECTED') {
    const error = new Error('Rejected visitors cannot be checked in');
    error.statusCode = 400;
    throw error;
  }

  // Rule 10: Cancelled visitors cannot be checked in
  if (visitor.status === 'CANCELLED') {
    const error = new Error('Cancelled visitors cannot be checked in');
    error.statusCode = 400;
    throw error;
  }

  // Rule 6: Visitors can only be checked in after approval
  if (visitor.status !== 'APPROVED') {
    const error = new Error(`Visitors can only be checked in after approval. Current status: ${visitor.status}`);
    error.statusCode = 400;
    throw error;
  }

  visitor.status = 'CHECKED_IN';
  visitor.checkInTime = new Date();
  visitor.checkedInBy = userId;

  await visitor.save();

  await logActivity({
    action: 'VISITOR_CHECKED_IN',
    visitorId: visitor._id,
    userId,
    role: 'RECEPTIONIST',
    remarks: 'Visitor checked in at reception',
  });

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role')
    .populate('checkedInBy', 'name email role');
};

/**
 * Check Out a visitor (CHECKED_IN -> CHECKED_OUT).
 * Enforces Rule 8 (Check-out time must be later than check-in time).
 */
const checkOutVisitor = async (id, userId) => {
  const visitor = await Visitor.findById(id);
  if (!visitor) {
    const error = new Error('Visitor record not found');
    error.statusCode = 404;
    throw error;
  }

  await checkAndProcessExpiredVisitor(visitor);

  if (visitor.status === 'CHECKED_OUT') {
    return visitor;
  }

  if (visitor.status !== 'CHECKED_IN') {
    const error = new Error(`Only currently checked-in visitors can be checked out. Current status: ${visitor.status}`);
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  // Rule 8: Check-out time must always be later than check-in time
  if (visitor.checkInTime && now <= new Date(visitor.checkInTime)) {
    const error = new Error('Check-out time must be later than check-in time');
    error.statusCode = 400;
    throw error;
  }

  visitor.status = 'CHECKED_OUT';
  visitor.checkOutTime = now;
  visitor.checkedOutBy = userId;

  await visitor.save();

  await logActivity({
    action: 'VISITOR_CHECKED_OUT',
    visitorId: visitor._id,
    userId,
    role: 'RECEPTIONIST',
    remarks: 'Visitor checked out',
  });

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role')
    .populate('checkedInBy', 'name email role')
    .populate('checkedOutBy', 'name email role');
};

/**
 * Get active visitors currently inside the premises (status === CHECKED_IN).
 * Enforces Rule 10 (Cancelled visitors never appear).
 */
const getActiveVisitorsInside = async (query) => {
  await processExpiredVisitors();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: 'CHECKED_IN' };

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { visitorId: searchRegex },
      { company: searchRegex },
    ];
  }

  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .populate('checkedInBy', 'name email role')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get visitors checked in today.
 */
const getTodayCheckIns = async (query) => {
  await processExpiredVisitors();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const filter = {
    checkInTime: { $gte: startOfDay, $lte: endOfDay },
  };

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { visitorId: searchRegex },
      { company: searchRegex },
    ];
  }

  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .populate('checkedInBy', 'name email role')
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get visitors checked out today.
 */
const getTodayCheckOuts = async (query) => {
  await processExpiredVisitors();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const filter = {
    checkOutTime: { $gte: startOfDay, $lte: endOfDay },
  };

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { visitorId: searchRegex },
      { company: searchRegex },
    ];
  }

  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .populate('checkedOutBy', 'name email role')
      .sort({ checkOutTime: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get pending visitors that have not been allocated to any employee (employee === null).
 */
const getUnallocatedVisitors = async (query = {}) => {
  await processExpiredVisitors();

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    employee: null,
    status: 'PENDING',
  };

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { visitorId: searchRegex },
      { company: searchRegex },
    ];
  }

  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    visitors,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Allocate an unallocated pending visitor to an eligible employee.
 */
const allocateVisitor = async (visitorId, employeeId, user) => {
  const visitor = await Visitor.findById(visitorId);
  if (!visitor) {
    const error = new Error('Visitor record not found');
    error.statusCode = 404;
    throw error;
  }

  if (visitor.status !== 'PENDING') {
    const error = new Error(`Cannot allocate a visitor with status '${visitor.status}'. Only PENDING visitors can be allocated.`);
    error.statusCode = 400;
    throw error;
  }

  if (visitor.employee) {
    const error = new Error('Visitor is already allocated to an employee');
    error.statusCode = 400;
    throw error;
  }

  const hostEmployee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  if (!hostEmployee) {
    const error = new Error('Selected employee not found');
    error.statusCode = 404;
    throw error;
  }

  if (hostEmployee.status === 'Inactive') {
    const error = new Error(`Employee ${hostEmployee.firstName} ${hostEmployee.lastName} is Inactive and cannot receive visitors`);
    error.statusCode = 400;
    throw error;
  }

  // Check capacity limit
  const activeStatuses = ['PENDING', 'APPROVED', 'CHECKED_IN'];
  const currentCount = await Visitor.countDocuments({
    employee: hostEmployee._id,
    status: { $in: activeStatuses },
  });

  const maxCapacity = hostEmployee.maxVisitorCapacity || 1;
  if (currentCount >= maxCapacity) {
    const error = new Error(`Employee ${hostEmployee.firstName} ${hostEmployee.lastName} has reached maximum visitor capacity (${maxCapacity})`);
    error.statusCode = 400;
    throw error;
  }

  visitor.employee = hostEmployee._id;
  await visitor.save();

  await logActivity({
    action: 'VISITOR_ALLOCATED',
    visitorId: visitor._id,
    userId: user.id,
    role: user.role,
    remarks: `Visitor allocated to employee ${hostEmployee.firstName} ${hostEmployee.lastName} (${hostEmployee.employeeCode})`,
  });

  return await Visitor.findById(visitor._id)
    .populate('employee', 'employeeCode firstName lastName department designation status')
    .populate('createdBy', 'name email role');
};

/**
 * Dynamically allocate unallocated pending visitors to available eligible employees based on remaining capacity.
 *
 * NON-FIFO ALLOCATION STRATEGY:
 * 1. Fetch all pending unallocated visitors (employee === null, status === 'PENDING').
 * 2. Order visitors deterministically by visitorId ascending (e.g., VIS0001, VIS0002), NOT by registration timestamp (createdAt / FIFO).
 * 3. Fetch active employees (status === 'Active', isDeleted === false).
 * 4. Calculate each employee's current active visitor count (status in ['PENDING', 'APPROVED', 'CHECKED_IN']) and remaining capacity.
 * 5. Match eligible unallocated visitors to eligible employees with remaining capacity > 0.
 * 6. Skip full or inactive employees.
 * 7. Save allocations and record 'VISITOR_ALLOCATED' activity logs.
 */
const allocateDynamic = async (user) => {
  await processExpiredVisitors();

  // NON-FIFO: Sort deterministically by visitorId (ascending), NOT by registration time (createdAt)
  const unallocatedVisitors = await Visitor.find({
    employee: null,
    status: 'PENDING',
  }).sort({ visitorId: 1 });

  if (unallocatedVisitors.length === 0) {
    return {
      allocatedCount: 0,
      allocatedVisitors: [],
      message: 'No pending unallocated visitors found',
    };
  }

  const activeEmployees = await Employee.find({
    status: 'Active',
    isDeleted: false,
  });

  const activeStatuses = ['PENDING', 'APPROVED', 'CHECKED_IN'];
  const employeeCaps = await Promise.all(
    activeEmployees.map(async (emp) => {
      const count = await Visitor.countDocuments({
        employee: emp._id,
        status: { $in: activeStatuses },
      });
      const maxCap = emp.maxVisitorCapacity || 1;
      return {
        emp,
        currentCount: count,
        maxCapacity: maxCap,
        remainingCapacity: Math.max(0, maxCap - count),
      };
    })
  );

  let eligibleEmployees = employeeCaps.filter((e) => e.remainingCapacity > 0);
  const allocatedList = [];

  for (const visitor of unallocatedVisitors) {
    if (eligibleEmployees.length === 0) break;

    // Pick available employee with remaining capacity
    const target = eligibleEmployees[0];

    visitor.employee = target.emp._id;
    await visitor.save();

    await logActivity({
      action: 'VISITOR_ALLOCATED',
      visitorId: visitor._id,
      userId: user.id,
      role: user.role,
      remarks: `Visitor dynamically allocated to employee ${target.emp.firstName} ${target.emp.lastName} (${target.emp.employeeCode})`,
    });

    allocatedList.push(visitor);

    target.currentCount += 1;
    target.remainingCapacity -= 1;

    if (target.remainingCapacity <= 0) {
      eligibleEmployees = eligibleEmployees.filter((e) => e.remainingCapacity > 0);
    }
  }

  return {
    allocatedCount: allocatedList.length,
    allocatedVisitors: allocatedList,
    message: `${allocatedList.length} visitor(s) dynamically allocated to available employees`,
  };
};

module.exports = {
  getAllVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  cancelVisitor,
  getMyVisitorRequests,
  approveVisitorRequest,
  rejectVisitorRequest,
  checkInVisitor,
  checkOutVisitor,
  getActiveVisitorsInside,
  getTodayCheckIns,
  getTodayCheckOuts,
  processExpiredVisitors,
  getUnallocatedVisitors,
  allocateVisitor,
  allocateDynamic,
};

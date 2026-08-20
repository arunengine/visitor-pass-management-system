/**
 * Visitor Controller
 * Purpose: Handles HTTP requests for Visitor registration, searching, filtering, details retrieval, and cancellation.
 */

const visitorService = require('../services/visitorService');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get all visitors (with search, filter, pagination)
 * @route   GET /api/v1/visitors
 * @access  Private (Receptionist, Admin)
 */
const getVisitors = async (req, res, next) => {
  try {
    const result = await visitorService.getAllVisitors(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitors fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single visitor details by ID
 * @route   GET /api/v1/visitors/:id
 * @access  Private (Receptionist, Admin)
 */
const getVisitorById = async (req, res, next) => {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new visitor
 * @route   POST /api/v1/visitors
 * @access  Private (Receptionist, Admin)
 */
const createVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.createVisitor(req.body, req.user.id);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Visitor registered successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update visitor details
 * @route   PUT /api/v1/visitors/:id
 * @access  Private (Receptionist, Admin)
 */
const updateVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.updateVisitor(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor updated successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel visitor registration
 * @route   PATCH /api/v1/visitors/:id/cancel
 * @access  Private (Receptionist, Admin)
 */
const cancelVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.cancelVisitor(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor registration cancelled successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending visitor requests assigned to logged-in host employee
 * @route   GET /api/v1/visitors/my-pending
 * @access  Private (Employee, Admin)
 */
const getMyPending = async (req, res, next) => {
  try {
    const result = await visitorService.getMyVisitorRequests(req.user, 'PENDING', req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get approved visitor requests assigned to logged-in host employee
 * @route   GET /api/v1/visitors/my-approved
 * @access  Private (Employee, Admin)
 */
const getMyApproved = async (req, res, next) => {
  try {
    const result = await visitorService.getMyVisitorRequests(req.user, 'APPROVED', req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rejected visitor requests assigned to logged-in host employee
 * @route   GET /api/v1/visitors/my-rejected
 * @access  Private (Employee, Admin)
 */
const getMyRejected = async (req, res, next) => {
  try {
    const result = await visitorService.getMyVisitorRequests(req.user, 'REJECTED', req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a pending visitor request
 * @route   PATCH /api/v1/visitors/:id/approve
 * @access  Private (Employee, Admin)
 */
const approveVisitor = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const visitor = await visitorService.approveVisitorRequest(req.params.id, req.user, remarks);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor request APPROVED successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending visitor request
 * @route   PATCH /api/v1/visitors/:id/reject
 * @access  Private (Employee, Admin)
 */
const rejectVisitor = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const visitor = await visitorService.rejectVisitorRequest(req.params.id, req.user, remarks);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor request REJECTED',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check In a visitor (APPROVED -> CHECKED_IN)
 * @route   PATCH /api/v1/visitors/:id/check-in
 * @access  Private (Receptionist, Admin)
 */
const checkInVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.checkInVisitor(req.params.id, req.user.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor CHECKED IN successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check Out a visitor (CHECKED_IN -> CHECKED_OUT)
 * @route   PATCH /api/v1/visitors/:id/check-out
 * @access  Private (Receptionist, Admin)
 */
const checkOutVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.checkOutVisitor(req.params.id, req.user.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor CHECKED OUT successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active visitors currently inside the premises
 * @route   GET /api/v1/visitors/active-inside
 * @access  Private (Receptionist, Admin)
 */
const getActiveVisitors = async (req, res, next) => {
  try {
    const result = await visitorService.getActiveVisitorsInside(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get visitors checked in today
 * @route   GET /api/v1/visitors/today-checkins
 * @access  Private (Receptionist, Admin)
 */
const getTodayCheckIns = async (req, res, next) => {
  try {
    const result = await visitorService.getTodayCheckIns(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get visitors checked out today
 * @route   GET /api/v1/visitors/today-checkouts
 * @access  Private (Receptionist, Admin)
 */
const getTodayCheckOuts = async (req, res, next) => {
  try {
    const result = await visitorService.getTodayCheckOuts(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unallocated pending visitors
 * @route   GET /api/v1/visitors/unallocated
 * @access  Private (Receptionist, Admin)
 */
const getUnallocatedVisitors = async (req, res, next) => {
  try {
    const result = await visitorService.getUnallocatedVisitors(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Allocate a visitor to an employee
 * @route   PATCH /api/v1/visitors/:id/allocate
 * @access  Private (Receptionist, Admin)
 */
const allocateVisitor = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Employee ID is required for allocation',
      });
    }

    const visitor = await visitorService.allocateVisitor(req.params.id, employeeId, req.user);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Visitor allocated to host employee successfully',
      data: { visitor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dynamically allocate pending visitors to available employees
 * @route   POST /api/v1/visitors/allocate-dynamic
 * @access  Private (Receptionist, Admin)
 */
const allocateDynamic = async (req, res, next) => {
  try {
    const result = await visitorService.allocateDynamic(req.user);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  cancelVisitor,
  getMyPending,
  getMyApproved,
  getMyRejected,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  getActiveVisitors,
  getTodayCheckIns,
  getTodayCheckOuts,
  getUnallocatedVisitors,
  allocateVisitor,
  allocateDynamic,
};

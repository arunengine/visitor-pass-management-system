/**
 * Dashboard Service
 * Purpose: Aggregates live statistical data from MongoDB for Admin, Receptionist, and Employee dashboards.
 */

const Employee = require('../models/employeeModel');
const User = require('../models/userModel');
const Visitor = require('../models/visitorModel');

/**
 * Returns today's start and end date range.
 */
const getTodayDateRange = () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  return { startOfDay, endOfDay };
};

/**
 * Admin Dashboard Aggregated Statistics
 */
const getAdminDashboardStats = async () => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  const [
    totalEmployees,
    totalUserAccounts,
    totalVisitors,
    pendingRequests,
    approvedVisitors,
    rejectedVisitors,
    checkedInVisitors,
    currentlyInside,
    todayVisitors,
    todayCheckIns,
    todayCheckOuts,
  ] = await Promise.all([
    Employee.countDocuments({ isDeleted: false }),
    User.countDocuments({}),
    Visitor.countDocuments({}),
    Visitor.countDocuments({ status: 'PENDING' }),
    Visitor.countDocuments({ status: 'APPROVED' }),
    Visitor.countDocuments({ status: 'REJECTED' }),
    Visitor.countDocuments({ checkInTime: { $ne: null } }),
    Visitor.countDocuments({ status: 'CHECKED_IN' }),
    Visitor.countDocuments({ visitDate: { $gte: startOfDay, $lte: endOfDay } }),
    Visitor.countDocuments({ checkInTime: { $gte: startOfDay, $lte: endOfDay } }),
    Visitor.countDocuments({ checkOutTime: { $gte: startOfDay, $lte: endOfDay } }),
  ]);

  return {
    totalEmployees,
    totalUserAccounts,
    totalVisitors,
    pendingRequests,
    approvedVisitors,
    rejectedVisitors,
    checkedInVisitors,
    currentlyInside,
    todayVisitors,
    todayCheckIns,
    todayCheckOuts,
  };
};

/**
 * Reception Dashboard Aggregated Statistics
 */
const getReceptionDashboardStats = async () => {
  const { startOfDay, endOfDay } = getTodayDateRange();

  const [
    todayVisitors,
    pendingApprovals,
    approvedVisitors,
    currentlyInside,
    todayCheckIns,
    todayCheckOuts,
  ] = await Promise.all([
    Visitor.countDocuments({ visitDate: { $gte: startOfDay, $lte: endOfDay } }),
    Visitor.countDocuments({ status: 'PENDING' }),
    Visitor.countDocuments({ status: 'APPROVED' }),
    Visitor.countDocuments({ status: 'CHECKED_IN' }),
    Visitor.countDocuments({ checkInTime: { $gte: startOfDay, $lte: endOfDay } }),
    Visitor.countDocuments({ checkOutTime: { $gte: startOfDay, $lte: endOfDay } }),
  ]);

  return {
    todayVisitors,
    pendingApprovals,
    approvedVisitors,
    currentlyInside,
    todayCheckIns,
    todayCheckOuts,
  };
};

/**
 * Employee Dashboard Aggregated Statistics & Recent Requests
 */
const getEmployeeDashboardStats = async (user) => {
  const { startOfDay, endOfDay } = getTodayDateRange();
  let employeeId = user.employee;

  if (!employeeId && user.email) {
    const empDoc = await Employee.findOne({ email: user.email });
    if (empDoc) employeeId = empDoc._id;
  }

  if (!employeeId) {
    return {
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      todayVisitors: 0,
      recentRequests: [],
    };
  }

  const [
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    todayVisitors,
    recentRequests,
  ] = await Promise.all([
    Visitor.countDocuments({ employee: employeeId, status: 'PENDING' }),
    Visitor.countDocuments({ employee: employeeId, status: { $in: ['APPROVED', 'CHECKED_IN', 'CHECKED_OUT'] } }),
    Visitor.countDocuments({ employee: employeeId, status: 'REJECTED' }),
    Visitor.countDocuments({ employee: employeeId, visitDate: { $gte: startOfDay, $lte: endOfDay } }),
    Visitor.find({ employee: employeeId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    todayVisitors,
    recentRequests,
  };
};

module.exports = {
  getAdminDashboardStats,
  getReceptionDashboardStats,
  getEmployeeDashboardStats,
};

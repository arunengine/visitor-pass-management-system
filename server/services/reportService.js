/**
 * Report Service
 * Purpose: Performs MongoDB aggregation pipelines for Reports analytics:
 * Preset date range filtering (Today, This Week, This Month, Custom),
 * Department-wise breakdown, Most visited employee ranking, and report logs export.
 */

const Visitor = require('../models/visitorModel');
const mongoose = require('mongoose');

/**
 * Calculates start & end dates based on preset query or custom range.
 */
const getDateRangeFilter = (query) => {
  const { range, startDate, endDate } = query;
  const now = new Date();

  let start = new Date();
  let end = new Date();

  if (range === 'TODAY') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'THIS_WEEK') {
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    start = new Date(now.setDate(diffToMonday));
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (range === 'THIS_MONTH') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else if (startDate && endDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    // Default to last 30 days
    start = new Date(now.setDate(now.getDate() - 30));
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

/**
 * Gets aggregated summary statistics for reports.
 */
const getReportSummary = async (query) => {
  const { start, end } = getDateRangeFilter(query);

  const dateMatchFilter = {
    visitDate: { $gte: start, $lte: end },
  };

  // 1. Status Breakdown Counts
  const [
    totalVisitors,
    approvedCount,
    rejectedCount,
    pendingCount,
    checkedInCount,
    checkedOutCount,
    cancelledCount,
  ] = await Promise.all([
    Visitor.countDocuments(dateMatchFilter),
    Visitor.countDocuments({ ...dateMatchFilter, status: 'APPROVED' }),
    Visitor.countDocuments({ ...dateMatchFilter, status: 'REJECTED' }),
    Visitor.countDocuments({ ...dateMatchFilter, status: 'PENDING' }),
    Visitor.countDocuments({ ...dateMatchFilter, status: 'CHECKED_IN' }),
    Visitor.countDocuments({ ...dateMatchFilter, status: 'CHECKED_OUT' }),
    Visitor.countDocuments({ ...dateMatchFilter, status: 'CANCELLED' }),
  ]);

  // 2. Department-Wise Breakdown Aggregation Pipeline
  const departmentBreakdown = await Visitor.aggregate([
    { $match: dateMatchFilter },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employeeInfo',
      },
    },
    { $unwind: '$employeeInfo' },
    {
      $group: {
        _id: '$employeeInfo.department',
        totalVisitors: { $sum: 1 },
      },
    },
    { $sort: { totalVisitors: -1 } },
  ]);

  // 3. Most Visited Employee Aggregation Pipeline
  const mostVisitedEmployees = await Visitor.aggregate([
    { $match: dateMatchFilter },
    {
      $group: {
        _id: '$employee',
        visitCount: { $sum: 1 },
      },
    },
    { $sort: { visitCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employeeDetails',
      },
    },
    { $unwind: '$employeeDetails' },
    {
      $project: {
        _id: 1,
        visitCount: 1,
        employeeCode: '$employeeDetails.employeeCode',
        name: { $concat: ['$employeeDetails.firstName', ' ', '$employeeDetails.lastName'] },
        department: '$employeeDetails.department',
      },
    },
  ]);

  return {
    dateRange: { start, end },
    stats: {
      totalVisitors,
      approvedCount,
      rejectedCount,
      pendingCount,
      checkedInCount,
      checkedOutCount,
      cancelledCount,
    },
    departmentBreakdown,
    mostVisitedEmployees,
  };
};

/**
 * Gets report visitor logs matching date range, search query, status filter, and pagination.
 */
const getReportVisitors = async (query) => {
  const { start, end } = getDateRangeFilter(query);
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    visitDate: { $gte: start, $lte: end },
  };

  if (query.status && query.status !== 'ALL') {
    filter.status = query.status;
  }

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
      .populate('employee', 'employeeCode firstName lastName department designation')
      .populate('createdBy', 'name email')
      .sort({ visitDate: -1 })
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

module.exports = {
  getReportSummary,
  getReportVisitors,
};

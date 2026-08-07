/**
 * Dashboard Controller
 * Purpose: Handles HTTP requests for live dashboard analytics data.
 */

const dashboardService = require('../services/dashboardService');
const { HTTP_STATUS } = require('../constants');

const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminDashboardStats();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getReceptionDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getReceptionDashboardStats();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getEmployeeDashboardStats(req.user);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getReceptionDashboard,
  getEmployeeDashboard,
};

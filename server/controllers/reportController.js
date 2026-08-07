/**
 * Report Controller
 * Purpose: Handles HTTP requests for report aggregations and report visitor logs.
 */

const reportService = require('../services/reportService');
const { HTTP_STATUS } = require('../constants');

const getReportSummary = async (req, res, next) => {
  try {
    const result = await reportService.getReportSummary(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getReportVisitors = async (req, res, next) => {
  try {
    const result = await reportService.getReportVisitors(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportSummary,
  getReportVisitors,
};

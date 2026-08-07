/**
 * Activity Controller
 * Purpose: Handles HTTP requests for retrieving audit activity history logs.
 */

const Activity = require('../models/activityModel');
const { HTTP_STATUS } = require('../constants');

const getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.action && req.query.action !== 'ALL') {
      filter.action = req.query.action;
    }

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('visitor', 'visitorId fullName phone company')
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
};

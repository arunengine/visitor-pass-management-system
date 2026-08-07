/**
 * Activity Logger Utility
 * Purpose: Asynchronously saves audit activity entries whenever visitor actions occur.
 */

const Activity = require('../models/activityModel');

const logActivity = async ({ action, visitorId, userId, role, remarks = '' }) => {
  try {
    await Activity.create({
      action,
      visitor: visitorId,
      performedBy: userId,
      role: role || 'SYSTEM',
      remarks,
    });
  } catch (error) {
    console.error('[Activity Logger Error]:', error.message);
  }
};

module.exports = logActivity;

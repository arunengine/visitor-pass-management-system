/**
 * Settings Service
 * Purpose: Business logic for retrieving and updating system configuration settings.
 */

const Settings = require('../models/settingsModel');

/**
 * Get current system settings or create default settings if none exists.
 */
const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ defaultMeetingDuration: 30 });
  }
  return settings;
};

/**
 * Update system settings.
 */
const updateSettings = async (updateData) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }

  if (updateData.defaultMeetingDuration !== undefined) {
    const duration = parseInt(updateData.defaultMeetingDuration, 10);
    if (isNaN(duration) || duration < 1) {
      const error = new Error('Default meeting duration must be a valid positive number');
      error.statusCode = 400;
      throw error;
    }
    settings.defaultMeetingDuration = duration;
  }

  await settings.save();
  return settings;
};

module.exports = {
  getSettings,
  updateSettings,
};

/**
 * Settings Controller
 * Purpose: Handles HTTP requests for retrieving and updating application configuration settings.
 */

const settingsService = require('../services/settingsService');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get system settings
 * @route   GET /api/v1/settings
 * @access  Private (All authenticated users)
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/v1/settings
 * @access  Private (Admin only)
 */
const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};

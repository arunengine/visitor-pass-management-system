/**
 * User Controller
 * Purpose: Handles HTTP requests for User account creation, modification, status toggling, and password reset.
 */

const userService = require('../services/userService');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get all users (search, role/status filters, pagination)
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Users fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user details by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user account linked to an Employee
 * @route   POST /api/v1/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User account created successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user account details (Role / Email / Name)
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User account updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate/Deactivate user status
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private (Admin)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'isActive must be a boolean value (true or false)',
      });
    }

    const user = await userService.toggleUserStatus(req.params.id, isActive, req.user.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `User status changed to ${isActive ? 'Active' : 'Inactive'}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset user password
 * @route   PATCH /api/v1/users/:id/reset-password
 * @access  Private (Admin)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const result = await userService.resetUserPassword(req.params.id, newPassword);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
};

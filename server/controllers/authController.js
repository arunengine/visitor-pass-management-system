/**
 * Auth Controller
 * Purpose: Handles HTTP requests for login, logout, and fetching current logged-in user profile.
 */

const authService = require('../services/authService');
const { sendTokenCookie } = require('../utils/jwt');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Authenticate User & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);

    // Send JWT inside an HttpOnly cookie
    sendTokenCookie(res, token);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Instantly expire cookie
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get Current Logged In User
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getCurrentUser,
};

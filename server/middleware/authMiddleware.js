/**
 * Authentication Middleware (protect)
 * Purpose: Verifies JWT token present in HttpOnly cookies or Authorization header.
 * Attaches decoded user payload to req.user for protected route access.
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/userModel');
const { HTTP_STATUS } = require('../constants');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in HttpOnly cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback check for Authorization Bearer header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Reject if no token found
  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized, token missing. Please log in.',
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from DB to verify user exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User account is deactivated or no longer exists.',
      });
    }

    // Attach user payload to Express request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee: user.employee || null,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized, invalid or expired token.',
    });
  }
};

module.exports = { protect };

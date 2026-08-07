/**
 * JWT Utility Functions
 * Purpose: Provides helper functions to sign JWT tokens, verify tokens,
 * and attach secure HttpOnly cookies to Express responses.
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token signed with user payload and secret.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Verifies a JSON Web Token string.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Attaches JWT token as an HttpOnly secure cookie to the HTTP response.
 */
const sendTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript access to prevent XSS attacks
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 1 day cookie expiration
  };

  res.cookie('token', token, cookieOptions);
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenCookie,
};

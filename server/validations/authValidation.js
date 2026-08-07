/**
 * Authentication Input Validation Rules
 * Purpose: Uses express-validator to sanitize and validate login input fields
 * before hitting the Auth Controller.
 */

const { body, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants');

// Middleware to check validation results and return error response if invalid
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// Login input validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

module.exports = {
  loginValidation,
};

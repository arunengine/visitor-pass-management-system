/**
 * User Input Validation Rules
 * Purpose: Validates request payloads for User account creation, profile update, and password reset using express-validator.
 */

const { body, validationResult } = require('express-validator');
const { HTTP_STATUS, ROLES } = require('../constants');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

const createUserValidation = [
  body('employeeId').optional().isMongoId().withMessage('Invalid Employee ID'),
  body('name').trim().notEmpty().withMessage('User name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid user role'),
  validateRequest,
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Invalid email format'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid user role'),
  validateRequest,
];

const resetPasswordValidation = [
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validateRequest,
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  resetPasswordValidation,
};

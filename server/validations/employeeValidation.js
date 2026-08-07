/**
 * Employee Input Validation Rules
 * Purpose: Validates request payloads for Employee creation and updates using express-validator.
 */

const { body, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../constants');

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

const createEmployeeValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address format'),
  body('phone').trim().notEmpty().withMessage('Phone number is required').isMobilePhone('any').withMessage('Invalid phone number'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
  validateRequest,
];

const updateEmployeeValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Invalid email address format'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('designation').optional().trim().notEmpty().withMessage('Designation cannot be empty'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
  validateRequest,
];

module.exports = {
  createEmployeeValidation,
  updateEmployeeValidation,
};

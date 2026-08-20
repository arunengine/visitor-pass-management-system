/**
 * Visitor Input Validation Rules
 * Purpose: Validates request payloads for Visitor registration and updates using express-validator.
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

const createVisitorValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Invalid email address format'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('idProofType').trim().notEmpty().withMessage('ID Proof type is required'),
  body('idProofNumber').trim().notEmpty().withMessage('ID Proof number is required'),
  body('purposeOfVisit').trim().notEmpty().withMessage('Purpose of visit is required'),
  body('visitDate').notEmpty().withMessage('Visit date is required').isISO8601().withMessage('Visit date must be a valid date'),
  body('expectedArrivalTime').trim().notEmpty().withMessage('Expected arrival time is required'),
  validateRequest,
];

const updateVisitorValidation = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number cannot be empty'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Invalid email address format'),
  body('company').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('idProofType').optional().trim().notEmpty().withMessage('ID Proof type cannot be empty'),
  body('idProofNumber').optional().trim().notEmpty().withMessage('ID Proof number cannot be empty'),
  body('employeeId').optional().isMongoId().withMessage('Valid host Employee ID is required'),
  body('purposeOfVisit').optional().trim().notEmpty().withMessage('Purpose of visit cannot be empty'),
  body('visitDate').optional().isISO8601().withMessage('Visit date must be a valid date'),
  body('expectedArrivalTime').optional().trim().notEmpty().withMessage('Expected arrival time cannot be empty'),
  validateRequest,
];

module.exports = {
  createVisitorValidation,
  updateVisitorValidation,
};

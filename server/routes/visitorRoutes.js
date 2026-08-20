/**
 * Visitor Routes
 * Purpose: Routes for Visitor registration actions (Get, Create, Edit, Cancel).
 * Protected and restricted to Receptionist and Admin roles.
 */

const express = require('express');
const router = express.Router();
const {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  cancelVisitor,
  getMyPending,
  getMyApproved,
  getMyRejected,
  approveVisitor,
  rejectVisitor,
  getActiveVisitors,
  getTodayCheckIns,
  getTodayCheckOuts,
  checkInVisitor,
  checkOutVisitor,
  getUnallocatedVisitors,
  allocateVisitor,
  allocateDynamic,
} = require('../controllers/visitorController');
const {
  createVisitorValidation,
  updateVisitorValidation,
} = require('../validations/visitorValidation');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// Apply protection to all visitor routes
router.use(protect);

// Employee & Admin routes for Approval Workflow
router.get('/my-pending', authorize(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.RECEPTIONIST), getMyPending);
router.get('/my-approved', authorize(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.RECEPTIONIST), getMyApproved);
router.get('/my-rejected', authorize(ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.RECEPTIONIST), getMyRejected);
router.patch('/:id/approve', authorize(ROLES.EMPLOYEE, ROLES.ADMIN), approveVisitor);
router.patch('/:id/reject', authorize(ROLES.EMPLOYEE, ROLES.ADMIN), rejectVisitor);

// Receptionist & Admin routes for Allocation Workflow
router.get('/unallocated', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getUnallocatedVisitors);
router.patch('/:id/allocate', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), allocateVisitor);
router.post('/allocate-dynamic', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), allocateDynamic);

// Receptionist & Admin routes for Check-In & Check-Out Operations
router.get('/active-inside', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getActiveVisitors);
router.get('/today-checkins', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getTodayCheckIns);
router.get('/today-checkouts', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getTodayCheckOuts);
router.patch('/:id/check-in', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), checkInVisitor);
router.patch('/:id/check-out', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), checkOutVisitor);

// Receptionist & Admin routes for Registration & Management
router.get('/', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getVisitors);
router.get('/:id', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getVisitorById);
router.post('/', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), createVisitorValidation, createVisitor);
router.put('/:id', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), updateVisitorValidation, updateVisitor);
router.patch('/:id/cancel', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), cancelVisitor);

module.exports = router;

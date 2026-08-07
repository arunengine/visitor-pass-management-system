/**
 * Employee Routes
 * Purpose: Maps HTTP requests for Employee CRUD actions to Employee Controllers.
 * All endpoints are protected and restricted to Admin role.
 */

const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} = require('../controllers/employeeController');
const {
  createEmployeeValidation,
  updateEmployeeValidation,
} = require('../validations/employeeValidation');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// Apply protection & Admin authorization to all employee routes
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployeeValidation, createEmployee);
router.put('/:id', updateEmployeeValidation, updateEmployee);
router.patch('/:id/status', updateEmployeeStatus);
router.delete('/:id', deleteEmployee);

module.exports = router;

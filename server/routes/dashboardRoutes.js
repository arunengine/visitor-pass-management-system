/**
 * Dashboard Routes
 * Purpose: Routes for fetching live dashboard stats for Admin, Receptionist, and Employee roles.
 */

const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getReceptionDashboard,
  getEmployeeDashboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router.get('/admin', authorize(ROLES.ADMIN), getAdminDashboard);
router.get('/reception', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getReceptionDashboard);
router.get('/employee', authorize(ROLES.EMPLOYEE, ROLES.ADMIN), getEmployeeDashboard);

module.exports = router;

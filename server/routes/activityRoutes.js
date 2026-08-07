/**
 * Activity Routes
 * Purpose: Endpoints for fetching system audit activity history.
 */

const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.RECEPTIONIST));

router.get('/', getActivities);

module.exports = router;

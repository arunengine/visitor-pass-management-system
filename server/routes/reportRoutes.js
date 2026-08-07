/**
 * Report Routes
 * Purpose: Endpoints for generating report summaries and querying report logs.
 */

const express = require('express');
const router = express.Router();
const { getReportSummary, getReportVisitors } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.RECEPTIONIST));

router.get('/summary', getReportSummary);
router.get('/visitors', getReportVisitors);

module.exports = router;

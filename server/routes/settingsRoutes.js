/**
 * Settings Routes
 * Purpose: Routes for fetching and updating system settings.
 * Protected and restricted as appropriate.
 */

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize(ROLES.ADMIN), updateSettings);

module.exports = router;

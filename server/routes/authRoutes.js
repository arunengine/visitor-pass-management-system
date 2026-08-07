/**
 * Auth Routes
 * Purpose: Defines API endpoints for authentication actions (login, logout, get current user profile).
 */

const express = require('express');
const router = express.Router();
const { login, logout, getCurrentUser } = require('../controllers/authController');
const { loginValidation } = require('../validations/authValidation');
const { protect } = require('../middleware/authMiddleware');

// Public route: Authenticate User & get token
router.post('/login', loginValidation, login);

// Protected route: Logout user & clear cookie
router.post('/logout', protect, logout);

// Protected route: Fetch current logged-in user profile
router.get('/me', protect, getCurrentUser);

module.exports = router;

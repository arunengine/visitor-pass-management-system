/**
 * User Management Routes
 * Purpose: Routes for User account management actions (Get, Create, Edit, Toggle Status, Reset Password).
 * Protected and restricted exclusively to Admin role.
 */

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
} = require('../controllers/userController');
const {
  createUserValidation,
  updateUserValidation,
  resetPasswordValidation,
} = require('../validations/userValidation');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants');

// Apply protection & Admin authorization to all user routes
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUserValidation, updateUser);
router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/reset-password', resetPasswordValidation, resetPassword);

module.exports = router;

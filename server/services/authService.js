/**
 * Auth Service
 * Purpose: Contains core business logic for authentication operations
 * including login validation, user authentication, and fetching user profiles.
 */

const User = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

/**
 * Authenticates user credentials and returns user payload + JWT token.
 */
const loginUser = async (email, password) => {
  // Find user by email and explicitly include password field for comparison
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if account is active
  if (!user.isActive) {
    const error = new Error('Account is deactivated. Please contact Admin.');
    error.statusCode = 403;
    throw error;
  }

  // Verify password match using instance method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Form clean user response object without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };

  return { user: userResponse, token };
};

/**
 * Retrieves profile information for currently logged in user by ID.
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = {
  loginUser,
  getUserProfile,
};

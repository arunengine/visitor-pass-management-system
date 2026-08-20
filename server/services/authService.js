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
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  let user = await User.findOne({ email: cleanEmail }).select('+password');

  // If no User account exists, check if an Employee document exists with this email
  if (!user) {
    const Employee = require('../models/employeeModel');
    const emp = await Employee.findOne({ email: cleanEmail, isDeleted: false });
    if (emp) {
      user = await User.create({
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        password: password || 'Password123',
        role: 'EMPLOYEE',
        employee: emp._id,
        isActive: true,
      });
      user = await User.findOne({ email: cleanEmail }).select('+password');
    }
  }

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

  // If role is EMPLOYEE and user.employee is missing, attempt linking by email
  if (user.role === 'EMPLOYEE' && !user.employee) {
    const Employee = require('../models/employeeModel');
    const emp = await Employee.findOne({ email: cleanEmail, isDeleted: false });
    if (emp) {
      user.employee = emp._id;
      await user.save();
    }
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

  const populatedUser = await User.findById(user._id).select('-password').populate('employee');

  // Form clean user response object without password
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    employee: populatedUser ? populatedUser.employee : null,
    isActive: user.isActive,
  };

  return { user: userResponse, token };
};

/**
 * Retrieves profile information for currently logged in user by ID.
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password').populate('employee');
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

/**
 * User Service
 * Purpose: Business logic for User account management including Employee-User linking,
 * status toggling, self-deactivation protection for Admins, and password resets.
 */

const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Employee = require('../models/employeeModel');

/**
 * Get all users with search, role/status filters, pagination, and populated employee info.
 */
const getAllUsers = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Search by Name or Email
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  // Filter by Role
  if (query.role && query.role !== 'ALL') {
    filter.role = query.role;
  }

  // Filter by Status (Active/Inactive)
  if (query.status && query.status !== 'ALL') {
    filter.isActive = query.status === 'Active';
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .populate('employee', 'employeeCode firstName lastName department designation status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get single user by ID.
 */
const getUserById = async (id) => {
  const user = await User.findById(id)
    .select('-password')
    .populate('employee', 'employeeCode firstName lastName department designation status');
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

/**
 * Create a new user account linked to an Employee.
 */
const createUser = async (userData) => {
  const { employeeId, name, email, password, role } = userData;

  // Check unique Email constraint
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    const error = new Error('A user account with this email address already exists');
    error.statusCode = 400;
    throw error;
  }

  let employeeRef = null;

  if (employeeId) {
    const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
    if (!employee) {
      const error = new Error('Selected employee not found');
      error.statusCode = 404;
      throw error;
    }

    // Business Rule: Inactive employees cannot receive User Accounts
    if (employee.status === 'Inactive') {
      const error = new Error('Inactive employees cannot receive User Accounts. Please activate the employee first.');
      error.statusCode = 400;
      throw error;
    }

    // Business Rule: One Employee can have only one User Account
    const existingUserLink = await User.findOne({ employee: employeeId });
    if (existingUserLink) {
      const error = new Error('This employee already has an assigned User Account.');
      error.statusCode = 400;
      throw error;
    }

    employeeRef = employee._id;
  }

  const newUser = new User({
    employee: employeeRef,
    name,
    email: email.toLowerCase(),
    password, // Pre-save hook automatically hashes password via bcrypt
    role,
    isActive: true,
  });

  await newUser.save();

  // Return user payload without password
  return await User.findById(newUser._id)
    .select('-password')
    .populate('employee', 'employeeCode firstName lastName department designation status');
};

/**
 * Update user account details.
 */
const updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  // Check email uniqueness if email is modified
  if (updateData.email && updateData.email.toLowerCase() !== user.email) {
    const existingEmail = await User.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existingEmail) {
      const error = new Error('A user account with this email address already exists');
      error.statusCode = 400;
      throw error;
    }
    user.email = updateData.email.toLowerCase();
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.role) user.role = updateData.role;

  await user.save();

  return await User.findById(user._id)
    .select('-password')
    .populate('employee', 'employeeCode firstName lastName department designation status');
};

/**
 * Toggle user active/inactive status.
 * Enforces rule: Admin cannot deactivate their own account.
 */
const toggleUserStatus = async (id, status, adminUserId) => {
  // Rule: Admin cannot deactivate himself
  if (id.toString() === adminUserId.toString() && status === false) {
    const error = new Error('You cannot deactivate your own Admin account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = status;
  await user.save();

  return await User.findById(user._id)
    .select('-password')
    .populate('employee', 'employeeCode firstName lastName department designation status');
};

/**
 * Reset user password.
 */
const resetUserPassword = async (id, newPassword) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  // Update password field. Setting user.password triggers the pre('save') bcrypt hashing hook
  user.password = newPassword;
  await user.save();

  return { message: 'Password reset successfully' };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
};

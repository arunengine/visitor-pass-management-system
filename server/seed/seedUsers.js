/**
 * User Database Seeder Script
 * Purpose: Inserts initial default accounts for Admin, Receptionist, and Employee
 * into MongoDB for testing authentication during technical interviews.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { ROLES } = require('../constants');

const seedUsers = [
  {
    name: 'System Administrator',
    email: 'admin@company.com',
    password: 'Password123',
    role: ROLES.ADMIN,
    isActive: true,
  },
  {
    name: 'Receptionist Desk',
    email: 'reception@company.com',
    password: 'Password123',
    role: ROLES.RECEPTIONIST,
    isActive: true,
  },
  {
    name: 'Corporate Employee',
    email: 'employee@company.com',
    password: 'Password123',
    role: ROLES.EMPLOYEE,
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/visitor_pass_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder]: Connected to MongoDB...');

    // Clear existing users
    await User.deleteMany({});
    console.log('[Seeder]: Cleared existing users from database.');

    // Create users individually so pre-save password hashing hooks execute
    for (const userData of seedUsers) {
      await User.create(userData);
      console.log(`[Seeder Created]: ${userData.role} -> ${userData.email}`);
    }

    console.log('[Seeder Success]: All default users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error.message);
    process.exit(1);
  }
};

seedDatabase();

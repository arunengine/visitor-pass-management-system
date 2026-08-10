/**
 * Database Configuration
 * Purpose: Establishes connection to MongoDB using Mongoose.
 * Logs successful connection or handles connection errors cleanly.
 */

const mongoose = require('mongoose');

const autoSeedInitialUsers = async () => {
  try {
    const User = require('../models/userModel');
    const Employee = require('../models/employeeModel');
    const { ROLES } = require('../constants');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seeder]: Database has no users. Seeding default accounts...');

      // Seed initial sample employee if none exist
      let sampleEmp = await Employee.findOne({ email: 'employee.host@company.com' });
      if (!sampleEmp) {
        sampleEmp = await Employee.create({
          employeeCode: 'EMP001',
          firstName: 'Corporate',
          lastName: 'Host',
          email: 'employee.host@company.com',
          phone: '9876543210',
          department: 'Engineering',
          designation: 'Senior Lead',
          status: 'Active',
        });
      }

      const defaultUsers = [
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
          name: 'Receptionist Alias',
          email: 'receptionist@company.com',
          password: 'Password123',
          role: ROLES.RECEPTIONIST,
          isActive: true,
        },
        {
          name: 'Corporate Employee',
          email: 'employee@company.com',
          password: 'Password123',
          role: ROLES.EMPLOYEE,
          employee: sampleEmp._id,
          isActive: true,
        },
      ];

      for (const u of defaultUsers) {
        await User.create(u);
        console.log(`[Auto-Seeded User]: ${u.email} (${u.role})`);
      }
      console.log('[Auto-Seeder]: Default accounts seeded successfully!');
    }
  } catch (err) {
    console.error('[Auto-Seeder Error]:', err.message);
  }
};

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb+srv://visitpass:7W6AKORtBNxCok14@cluster0.1mxsv6k.mongodb.net/visitpass?retryWrites=true&w=majority';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}`);
    
    // Auto-seed initial users if collection is empty
    await autoSeedInitialUsers();
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

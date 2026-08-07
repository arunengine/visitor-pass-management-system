/**
 * Employee Database Seeder Script
 * Purpose: Inserts sample employee records into MongoDB for testing Admin Employee Management.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Employee = require('../models/employeeModel');

const seedEmployees = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@company.com',
    phone: '9876543210',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    status: 'Active',
  },
  {
    firstName: 'Ananya',
    lastName: 'Sen',
    email: 'ananya.sen@company.com',
    phone: '9876543211',
    department: 'Human Resources',
    designation: 'HR Manager',
    status: 'Active',
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@company.com',
    phone: '9876543212',
    department: 'Finance',
    designation: 'Financial Analyst',
    status: 'Inactive',
  },
];

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Employee Seeder]: Connected to MongoDB...');

    await Employee.deleteMany({});
    console.log('[Employee Seeder]: Cleared existing employee records.');

    for (const empData of seedEmployees) {
      await Employee.create(empData);
    }

    console.log('[Employee Seeder Success]: Seeded initial sample employees!');
    process.exit(0);
  } catch (error) {
    console.error('[Employee Seeder Error]:', error.message);
    process.exit(1);
  }
};

runSeeder();

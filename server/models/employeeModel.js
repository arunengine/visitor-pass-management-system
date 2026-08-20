/**
 * Employee Model Schema
 * Purpose: Defines database schema for corporate employees.
 * Includes automatic sequential employeeCode generation (EMP001, EMP002) and soft delete support.
 */

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    maxVisitorCapacity: {
      type: Number,
      default: 1,
      min: [1, 'Maximum visitor capacity must be at least 1'],
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete flag
      select: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook: Auto-generate sequential employeeCode (EMP001, EMP002, etc.)
employeeSchema.pre('validate', async function (next) {
  if (this.isNew && !this.employeeCode) {
    try {
      // Find latest created employee to determine next sequence index
      const lastEmployee = await mongoose
        .model('Employee')
        .findOne({}, { employeeCode: 1 })
        .sort({ createdAt: -1 });

      let nextIndex = 1;
      if (lastEmployee && lastEmployee.employeeCode) {
        // Extract numeric part from 'EMP005' -> 5
        const currentNumber = parseInt(lastEmployee.employeeCode.replace('EMP', ''), 10);
        if (!isNaN(currentNumber)) {
          nextIndex = currentNumber + 1;
        }
      }

      // Format with leading zeros: 1 -> EMP001, 12 -> EMP012
      this.employeeCode = `EMP${String(nextIndex).padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

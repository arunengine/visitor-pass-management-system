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
      // Find all existing employees to determine highest existing EMP sequence index
      const employees = await mongoose
        .model('Employee')
        .find({}, { employeeCode: 1 });

      let maxNumber = 0;

      employees.forEach((emp) => {
        if (emp.employeeCode) {
          // Extract numeric part from standard codes like 'EMP005' -> 5 or 'EMP12' -> 12
          const match = emp.employeeCode.match(/^EMP(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      });

      let nextIndex = maxNumber + 1;
      let candidateCode = `EMP${String(nextIndex).padStart(3, '0')}`;

      // Uniqueness guarantee: ensure candidateCode does not collide with any existing employee
      while (await mongoose.model('Employee').findOne({ employeeCode: candidateCode })) {
        nextIndex++;
        candidateCode = `EMP${String(nextIndex).padStart(3, '0')}`;
      }

      this.employeeCode = candidateCode;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

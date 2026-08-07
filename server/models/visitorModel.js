/**
 * Visitor Model Schema
 * Purpose: Defines database schema for Visitors registered at reception.
 * Includes automatic sequential visitorId generation (VIS0001, VIS0002) and references to Employee & User models.
 */

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
    idProofType: {
      type: String,
      required: [true, 'ID Proof type is required'],
      enum: ['Aadhaar', 'PAN Card', 'Driving License', 'Passport', 'Voter ID', 'Other'],
    },
    idProofNumber: {
      type: String,
      required: [true, 'ID Proof number is required'],
      trim: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Host employee reference is required'],
    },
    purposeOfVisit: {
      type: String,
      required: [true, 'Purpose of visit is required'],
      trim: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required'],
    },
    expectedArrivalTime: {
      type: String,
      required: [true, 'Expected arrival time is required'],
      trim: true, // e.g. "14:30"
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'],
      default: 'PENDING',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvalRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook: Auto-generate sequential visitorId (VIS0001, VIS0002, etc.)
visitorSchema.pre('validate', async function (next) {
  if (this.isNew && !this.visitorId) {
    try {
      const lastVisitor = await mongoose
        .model('Visitor')
        .findOne({}, { visitorId: 1 })
        .sort({ createdAt: -1 });

      let nextIndex = 1;
      if (lastVisitor && lastVisitor.visitorId) {
        const currentNumber = parseInt(lastVisitor.visitorId.replace('VIS', ''), 10);
        if (!isNaN(currentNumber)) {
          nextIndex = currentNumber + 1;
        }
      }

      // Format with 4 leading zeros: 1 -> VIS0001, 12 -> VIS0012
      this.visitorId = `VIS${String(nextIndex).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Database Index Optimization
visitorSchema.index({ visitorId: 1 });
visitorSchema.index({ phone: 1, visitDate: 1 });
visitorSchema.index({ employee: 1, status: 1 });
visitorSchema.index({ status: 1, visitDate: 1 });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;

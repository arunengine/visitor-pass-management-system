/**
 * Activity Model Schema
 * Purpose: Defines database schema for system audit logs.
 * Automatically records actions (visitor created, approved, rejected, checked in, checked out, cancelled).
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'VISITOR_CREATED',
        'VISITOR_UPDATED',
        'VISITOR_CANCELLED',
        'VISITOR_APPROVED',
        'VISITOR_REJECTED',
        'VISITOR_CHECKED_IN',
        'VISITOR_CHECKED_OUT',
        'VISITOR_ALLOCATED',
      ],
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    role: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;

/**
 * Settings Model Schema
 * Purpose: Defines database schema for system-wide configuration settings,
 * including default meeting duration for visitor passes.
 */

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    defaultMeetingDuration: {
      type: Number,
      default: 30,
      required: [true, 'Default meeting duration is required'],
      min: [1, 'Meeting duration must be at least 1 minute'],
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;

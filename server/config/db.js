/**
 * Database Configuration
 * Purpose: Establishes connection to MongoDB using Mongoose.
 * Logs successful connection or handles connection errors cleanly.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;

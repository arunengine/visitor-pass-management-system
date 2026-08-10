/**
 * Vercel Serverless API Entry Point
 * Purpose: Establishes MongoDB connection and delegates API requests to Express application.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const connectDB = require('../server/config/db');
const app = require('../server/app');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Serverless DB Error]:', err.message);
    }
  }
  return app(req, res);
};

/**
 * Express Application Config
 * Purpose: Configures middleware, global error handling, and routes for Express.
 * Decoupled from server listener for modularity and easy testing.
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { HTTP_STATUS } = require('./constants');

const app = express();

// Global Middleware Configuration
app.use(morgan('dev')); // Log HTTP requests to console
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent across origins
  })
);
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse Cookies

// Health Check Endpoint (For testing server status)
app.get('/api/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Visitor Pass Management API is running cleanly.',
    timestamp: new Date().toISOString(),
  });
});

// Fallback 404 Route for Unmatched Endpoints
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `API Route ${req.originalUrl} Not Found`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

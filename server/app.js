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

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const activityRoutes = require('./routes/activityRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { processExpiredVisitors } = require('./services/visitorService');

const app = express();

// Background job: Automatically check out expired visitors every 30 seconds
setInterval(() => {
  processExpiredVisitors();
}, 30 * 1000);

// Configure Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin is allowed/matches Vercel domain pattern
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true, // Allow HttpOnly cookies across origins
  })
);
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse Cookies

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/settings', settingsRoutes);

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

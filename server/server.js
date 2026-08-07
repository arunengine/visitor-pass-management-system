/**
 * Server Entry Point
 * Purpose: Loads environment variables, connects to database,
 * and starts listening for HTTP requests on the designated PORT.
 */

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start Server after initializing Database connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server Running]: Listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server Startup Error]:', error.message);
    process.exit(1);
  }
};

startServer();

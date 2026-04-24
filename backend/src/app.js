const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Added path module

// Load environment variables immediately
dotenv.config();

const corsConfig = require('./config/cors.config');
const apiRoutes = require('./routes/index.routes');

const app = express();

// Middlewares
// Allowing all origins for development and tunnel support
app.use(cors({
  origin: true, // Dynamically allows the request origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Added static file serving

// Debug log for routes
console.log('Mounting routes at /api/v1');

// Routes
app.use('/api/v1', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

/**
 * Global Error Handling Middleware
 */
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

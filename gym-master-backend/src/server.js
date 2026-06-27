// src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const progressRoutes = require('./routes/progress');
const rewardsRoutes = require('./routes/rewards');

// Initialize express app
const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware - EXPLICITLY configure with debug info
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Request body parsing debug for ${req.method} ${req.path}:`, 
    typeof req.body, 
    req.body ? Object.keys(req.body).length : 'no body'
  );
  next();
});

// Make sure URL encoded data is parsed too
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-master', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/rewards', rewardsRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Gym Master API',
    status: 'Server is running correctly'
  });
});

// Test route to verify server responsiveness
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Echo route for direct testing
app.post('/echo', (req, res) => {
  res.json({
    message: 'Echo endpoint',
    receivedData: req.body,
    headers: req.headers
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with explicit port
const PORT = process.env.PORT || 5001;

// Start server with proper error handling
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available test endpoints:');
  console.log(`- GET http://localhost:${PORT}/`);
  console.log(`- GET http://localhost:${PORT}/test`);
  console.log(`- POST http://localhost:${PORT}/echo`);
  console.log(`Main API routes:`);
  console.log(`- POST http://localhost:${PORT}/api/auth/register`);
  console.log(`- POST http://localhost:${PORT}/api/auth/login`);
  console.log(`- GET http://localhost:${PORT}/api/users/profile`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try using a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
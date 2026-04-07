const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const josiyamRoutes = require('./routes/josiyamRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Utility
const { errorResponse } = require('./utils/responseHandler');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Always allow same-origin / non-browser requests
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow local dev servers (Flutter web on localhost / 127.0.0.1)
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Optional explicit allow-list via ALLOWED_ORIGINS
    if (process.env.ALLOWED_ORIGINS) {
      const allowed = process.env.ALLOWED_ORIGINS.split(',');
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'STJ Backend API is running',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (canonical base: /api — e.g. POST /api/josiyam/single)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/josiyam', josiyamRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/report', reportRoutes);

// Legacy mounts (same handlers) for older clients that omit `/api`
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/josiyam', josiyamRoutes);
app.use('/partners', partnerRoutes);
app.use('/report', reportRoutes);

// 404 handler
app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  errorResponse(res, message, statusCode);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const financialHealthRoutes = require('./routes/financialHealthRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// CORS configuration
const getCorsOrigin = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // In production, use CORS_ORIGIN env var or default to wildcard
  if (env === 'production') {
    return process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : '*';
  }
  
  // In development, always include localhost:3000, plus any from CORS_ORIGIN
  const origins = ['http://localhost:3000'];
  
  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    origins.push(...envOrigins);
  }
  
  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigin();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // If wildcard is allowed, accept all
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Origin not allowed
    const msg = `The CORS policy for this site does not allow access from the origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours - cache preflight requests
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (production-grade)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} | ${req.method} ${req.path} | IP: ${req.ip || req.connection.remoteAddress}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📥', logMessage);
  }
  
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multiplus Financial Services API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/financial-health', financialHealthRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

module.exports = app;

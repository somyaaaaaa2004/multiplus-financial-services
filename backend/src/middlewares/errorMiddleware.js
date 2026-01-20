const { sendError } = require('../utils/response');

/**
 * Centralized error handling middleware
 * Logs errors with structured format and sends appropriate responses
 */
const errorMiddleware = (err, req, res, next) => {
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Structured error logging for production
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    method: req.method,
    path: req.path,
    statusCode: error.statusCode || 500,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Log error based on severity
  if (error.statusCode >= 500) {
    console.error('🔴 [ERROR]', JSON.stringify(errorLog, null, 2));
  } else {
    console.warn('⚠️  [WARN]', JSON.stringify(errorLog, null, 2));
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry found';
    return sendError(res, message, 400);
  }

  // MySQL table doesn't exist
  if (err.code === 'ER_NO_SUCH_TABLE') {
    const message = 'Database table not found';
    return sendError(res, message, 500);
  }

  // MySQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    const message = 'Database connection failed';
    return sendError(res, message, 500);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    return sendError(res, message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    return sendError(res, message, 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return sendError(res, message, 400);
  }

  // Default server error
  const statusCode = error.statusCode || 500;
  // Hide error details in production for security
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : (error.message || 'Server Error');
  sendError(res, message, statusCode);
};

module.exports = errorMiddleware;

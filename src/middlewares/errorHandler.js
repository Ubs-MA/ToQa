const multer = require('multer');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

// Converts known error types (Mongoose, JWT, Multer) into ApiError
const normalizeError = (err) => {
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new ApiError(409, `Duplicate value for ${field}. Please use another value.`);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    const apiErr = new ApiError(422, 'Validation failed');
    apiErr.errors = messages.map((message) => ({ message }));
    return apiErr;
  }

  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Your token has expired. Please log in again.');
  }

  if (err instanceof multer.MulterError) {
    return new ApiError(400, `File upload error: ${err.message}`);
  }

  return err;
};

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// Must be registered last. 4-arg signature required by Express.
const globalErrorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  const response = {
    status,
    message: error.isOperational ? error.message : 'Something went wrong. Please try again later.'
  };

  if (error.errors) response.errors = error.errors;
  if (process.env.NODE_ENV === 'development') response.stack = error.stack;

  res.status(statusCode).json(response);
};

module.exports = { globalErrorHandler, notFound };

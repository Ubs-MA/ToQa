const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const logger = require("../config/logger");

const convertKnownError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors || {}).map(
      (item) => item.message
    );

    return new ApiError(400, "Validation failed", errors);
  }

  if (error.name === "CastError") {
    return new ApiError(400, `Invalid ${error.path}`);
  }

  if (error.code === 11000) {
    const duplicatedFields = Object.keys(error.keyValue || {});

    return new ApiError(
      409,
      `Duplicate value for: ${duplicatedFields.join(", ")}`
    );
  }

  if (error.name === "JsonWebTokenError") {
    return new ApiError(401, "Invalid authentication token");
  }

  if (error.name === "TokenExpiredError") {
    return new ApiError(401, "Authentication token has expired");
  }

  return new ApiError(
    error.statusCode || 500,
    error.message || "Internal server error",
    [],
    error.stack
  );
};

const errorHandler = (error, req, res, next) => {
  const normalizedError = convertKnownError(error);
  const statusCode = normalizedError.statusCode || 500;

  logger.error(normalizedError.message, {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    stack: normalizedError.stack,
  });

  const response = {
    success: false,
    message:
      statusCode === 500 && env.nodeEnv === "production"
        ? "Internal server error"
        : normalizedError.message,
    errors: normalizedError.errors || [],
  };

  if (env.nodeEnv !== "production") {
    response.stack = normalizedError.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
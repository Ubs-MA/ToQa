const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const env = require("../config/env");

/**
 * Normalizes known error types (Mongoose, JWT, our own ApiError) into a
 * consistent ApiError, then serializes it. Must be registered last.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    error = normalizeError(err);
  }

  if (!error.isOperational) {
    logger.error(err.stack || err.message);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    errors: error.errors && error.errors.length ? error.errors : undefined,
    stack: env.nodeEnv === "development" ? err.stack : undefined,
  });
}

function normalizeError(err) {
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest("Validation failed", errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return ApiError.conflict(`${field} already in use`);
  }

  // Mongoose invalid ObjectId / cast error
  if (err.name === "CastError") {
    return ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return ApiError.unauthorized("Invalid authentication token");
  }
  if (err.name === "TokenExpiredError") {
    return ApiError.unauthorized("Authentication token has expired");
  }

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return ApiError.badRequest("Malformed JSON in request body");
  }

  // Payload too large (body-parser / raw-body)
  if (err.type === "entity.too.large" || err.status === 413) {
    return new ApiError(413, "Request payload is too large");
  }

  // Any other error that already carries a valid 4xx HTTP status (e.g. from
  // body-parser, cors, or other third-party middleware) — treat as
  // operational and preserve its status/message rather than falling to 500.
  const thirdPartyStatus = err.status || err.statusCode;
  if (typeof thirdPartyStatus === "number" && thirdPartyStatus >= 400 && thirdPartyStatus < 500) {
    return new ApiError(thirdPartyStatus, err.message || "Request error");
  }

  const fallback = new ApiError(500, err.message || "Internal server error");
  fallback.isOperational = false;
  return fallback;
}

module.exports = errorMiddleware;

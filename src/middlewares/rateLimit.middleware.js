const rateLimit = require("express-rate-limit");
const env = require("../config/env");

/**
 * General purpose limiter — applied to the whole API to blunt abuse/DoS.
 */
const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/**
 * Stricter limiter for authentication endpoints (register/login) to slow
 * down credential stuffing / brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

module.exports = { apiLimiter, authLimiter };

const morgan = require("morgan");

/**
 * `dev` format in non-production for concise colored logs;
 * `combined` in production for fuller Apache-style access logs.
 */
const requestLogger = morgan(
  process.env.NODE_ENV === "production" ? "combined" : "dev",
  {
    skip: () => process.env.NODE_ENV === "test",
  }
);

module.exports = requestLogger;

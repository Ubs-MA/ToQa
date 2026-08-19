/**
 * Wraps an async Express handler so rejected promises / thrown errors are
 * forwarded to next(err) instead of crashing the process or hanging the request.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

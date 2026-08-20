// Wraps async route handlers/controllers so rejected promises are
// forwarded to the centralized error handling middleware.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;

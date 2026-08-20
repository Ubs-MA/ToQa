const ApiError = require('../utils/ApiError');

// Usage: restrictTo('admin') or restrictTo('admin', 'customer')
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }
  next();
};

module.exports = { restrictTo };

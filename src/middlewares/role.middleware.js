const ApiError = require("../utils/ApiError");

/**
 * Usage: router.get('/', protect, authorize('admin'), handler)
 * Must run after the `protect` middleware so req.user is populated.
 */
function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("You are not logged in. Please log in to continue."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }

    return next();
  };
}

module.exports = authorize;

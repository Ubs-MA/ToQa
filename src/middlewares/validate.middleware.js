const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Runs after an array of express-validator chains. Collects any validation
 * errors and forwards a single ApiError(400) with field-level details.
 *
 * Usage: router.post('/register', registerValidator, validate, controller)
 */
function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(ApiError.badRequest("Validation failed", errors));
}

module.exports = validate;

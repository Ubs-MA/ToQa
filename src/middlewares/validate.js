const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after an array of express-validator checks; collects and
// forwards a formatted 422 error if any validation failed.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((err) => ({
    field: err.path,
    message: err.msg
  }));

  const error = new ApiError(422, 'Validation failed');
  error.errors = formatted;
  next(error);
};

module.exports = validate;

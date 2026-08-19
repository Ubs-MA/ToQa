const { param, body, query } = require("express-validator");

const userIdParamValidator = [
  param("userId").isMongoId().withMessage("Invalid user id"),
];

const listUsersValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("role")
    .optional()
    .isIn(["customer", "admin"])
    .withMessage("role must be 'customer' or 'admin'"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),
  query("search").optional().trim().isLength({ max: 200 }),
];

const updateUserStatusValidator = [
  ...userIdParamValidator,
  body("isActive")
    .notEmpty()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be true or false")
    .toBoolean(),
];

module.exports = {
  userIdParamValidator,
  listUsersValidator,
  updateUserStatusValidator,
};

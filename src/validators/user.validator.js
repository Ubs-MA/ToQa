const { body } = require("express-validator");

// Intentionally excludes email/role/isActive — those are not user-editable
// via this endpoint (email changes and role/status changes need their own
// verified flows / admin action).
const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("phone")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Please provide a valid phone number"),

  body("address").optional({ nullable: true }).trim().isLength({ max: 300 }),

  body("governorate").optional({ nullable: true }).trim().isLength({ max: 100 }),

  body(["email", "role", "isActive", "password"]).not().exists().withMessage(
    "This field cannot be updated through this endpoint"
  ),
];

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("New password must contain at least one number")
    .matches(/[a-zA-Z]/)
    .withMessage("New password must contain at least one letter")
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage("New password must be different from the current password"),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];

module.exports = { updateProfileValidator, changePasswordValidator };

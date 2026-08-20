const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 80 }),
  body("phone").optional().trim().isLength({ min: 7, max: 30 }),
  body("address").optional().trim().isLength({ max: 300 }),
  body("governorate").optional().trim().isLength({ max: 80 }),
];

const changePasswordValidator = [
  body("currentPassword").isString().notEmpty(),
  body("newPassword").isLength({ min: 8 }).matches(/[A-Za-z]/).matches(/\d/),
];

module.exports = { updateProfileValidator, changePasswordValidator };

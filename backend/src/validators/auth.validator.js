const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).matches(/[A-Za-z]/).matches(/\d/),
  body("phone").optional().trim().isLength({ min: 7, max: 30 }),
];

const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
];

module.exports = { registerValidator, loginValidator };

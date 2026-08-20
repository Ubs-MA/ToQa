const { body } = require("express-validator");
const productValidator = [
  body("name").trim().isLength({ min: 2, max: 140 }),
  body("slug").trim().isSlug(),
  body("description").trim().isLength({ min: 10, max: 4000 }),
  body("category").isMongoId(),
  body("images").optional().isArray({ max: 8 }),
  body("images.*").optional().isURL(),
  body("basePrice").isFloat({ min: 0 }).toFloat(),
  body("isActive").optional().isBoolean(),
];
module.exports = { productValidator };

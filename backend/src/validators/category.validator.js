const { body } = require("express-validator");
const categoryValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }),
  body("slug").trim().isSlug(),
  body("description").optional().trim().isLength({ max: 600 }),
  body("image").optional().isURL(),
  body("isActive").optional().isBoolean(),
];
module.exports = { categoryValidator };

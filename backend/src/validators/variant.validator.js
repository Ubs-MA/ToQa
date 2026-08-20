const { body } = require("express-validator");
const variantValidator = [
  body("size").trim().notEmpty(),
  body("color").trim().notEmpty(),
  body("sku").trim().notEmpty(),
  body("price").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body("stock").isInt({ min: 0 }).toInt(),
  body("isActive").optional().isBoolean(),
];
const stockValidator = [body("stock").isInt({ min: 0 }).toInt()];
module.exports = { variantValidator, stockValidator };

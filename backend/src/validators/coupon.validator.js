const { body } = require("express-validator");
const couponValidator = [
  body("code").trim().notEmpty(),
  body("type").isIn(["percentage", "fixed"]),
  body("value").isFloat({ min: 0 }).toFloat(),
  body("expiresAt").isISO8601().toDate(),
  body("usageLimit").optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body("minimumOrderAmount").optional().isFloat({ min: 0 }).toFloat(),
  body("isActive").optional().isBoolean(),
];
const validateCouponValidator = [body("code").trim().notEmpty(), body("subtotal").isFloat({ min: 0 }).toFloat()];
module.exports = { couponValidator, validateCouponValidator };

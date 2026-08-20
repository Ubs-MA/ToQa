const { body, param } = require("express-validator");
const PAYMENT_METHODS = require("../constants/paymentMethods");
const ORDER_STATUS = require("../constants/orderStatus");
const PAYMENT_STATUS = require("../constants/paymentStatus");

const checkoutValidator = [
  body("customer.name").trim().isLength({ min: 2, max: 80 }),
  body("customer.phone").trim().isLength({ min: 7, max: 30 }),
  body("customer.email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body("deliveryAddress").trim().isLength({ min: 5, max: 300 }),
  body("governorate").trim().isLength({ min: 2, max: 80 }),
  body("paymentMethod").isIn(Object.values(PAYMENT_METHODS)),
  body("paymentReference").if(body("paymentMethod").equals(PAYMENT_METHODS.ELECTRONIC_WALLET)).trim().notEmpty().withMessage("Wallet reference is required").isLength({ max: 120 }),
];
const orderStatusValidator = [param("orderId").isMongoId(), body("orderStatus").isIn(Object.values(ORDER_STATUS))];
const paymentStatusValidator = [param("orderId").isMongoId(), body("paymentStatus").isIn(Object.values(PAYMENT_STATUS))];
module.exports = { checkoutValidator, orderStatusValidator, paymentStatusValidator };

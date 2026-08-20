const { body, param } = require("express-validator");
const addItemValidator = [body("variantId").isMongoId(), body("quantity").isInt({ min: 1, max: 99 }).toInt()];
const updateItemValidator = [param("variantId").isMongoId(), body("quantity").isInt({ min: 1, max: 99 }).toInt()];
const couponCodeValidator = [body("code").trim().notEmpty()];
module.exports = { addItemValidator, updateItemValidator, couponCodeValidator };

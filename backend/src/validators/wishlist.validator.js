const { param } = require("express-validator");
const productIdValidator = [param("productId").isMongoId()];
module.exports = { productIdValidator };

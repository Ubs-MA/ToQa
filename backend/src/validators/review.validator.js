const { body, param } = require("express-validator");
const createReviewValidator = [param("productId").isMongoId(), body("rating").isInt({ min: 1, max: 5 }).toInt(), body("comment").trim().isLength({ min: 3, max: 1200 })];
const updateReviewValidator = [param("reviewId").isMongoId(), body("rating").optional().isInt({ min: 1, max: 5 }).toInt(), body("comment").optional().trim().isLength({ min: 3, max: 1200 })];
module.exports = { createReviewValidator, updateReviewValidator };

const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const { validateReviewInput } = require("../validators/review.validator");

// Create/update/delete are protected customer operations.
router.post("/products/:productId", validateReviewInput, reviewController.createReview);
router.get("/products/:productId", reviewController.getProductReviews);
router.patch("/:reviewId", validateReviewInput, reviewController.updateReview);
router.delete("/:reviewId", reviewController.deleteReview);

// Admin can use this endpoint after applying admin authorization middleware.
router.get("/", reviewController.getAllReviews);

module.exports = router;

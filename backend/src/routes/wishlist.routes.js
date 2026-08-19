const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlist.controller");

// Authentication middleware should be added by the main route/app setup.
router.get("/", wishlistController.getWishlist);
router.get("/check/:productId", wishlistController.checkWishlist);
router.post("/:productId", wishlistController.addProduct);
router.delete("/:productId", wishlistController.removeProduct);
router.delete("/", wishlistController.clearWishlist);

module.exports = router;

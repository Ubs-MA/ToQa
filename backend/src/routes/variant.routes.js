
//variant routes
const express = require("express");

const {
    updateStock,
    increaseStock,
    decreaseStock,
    getLowStock,
    getOutOfStock,
} = require("../controllers/variant.controller");



const router = express.Router();

router.patch("/:variantId/stock", updateStock);

router.patch("/:variantId/increase-stock", increaseStock);

router.patch("/:variantId/decrease-stock", decreaseStock);

router.get("/low-stock", getLowStock);

router.get("/out-of-stock", getOutOfStock);

module.exports = router;
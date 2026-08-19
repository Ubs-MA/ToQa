//product routes

const express = require("express");

const {searchProducts} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", searchProducts);

module.exports = router;
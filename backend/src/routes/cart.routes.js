const express = require("express");

const {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
} = require("../controllers/cart.controller");

//middlware for test
const router = express.Router();

router.use((req, res, next) => {
    req.user = {
        id: "68a1f2c3e4b5a6d7c8e9f012"
    };

    next();
});


router.get("/", getCart);

router.post("/items", addItem);

router.patch("/items/:variantId", updateItem);

router.delete("/items/:variantId", removeItem);

router.delete("/", clearCart);

module.exports = router;
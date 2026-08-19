const cartService = require("../services/cart.service");

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await cartService.getCart(userId);

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const addItem = async (req, res) => {
    try {
        const userId = req.user.id;

        const { productId, variantId, quantity } = req.body;

        const cart = await cartService.addItem(
            userId,
            productId,
            variantId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateItem = async (req, res) => {
    try {
        const userId = req.user.id;

        const {variantId} = req.params;

        const { quantity } = req.body;

        const cart = await cartService.updateItem(
            userId,
            variantId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const removeItem = async (req, res) => {
    try {
        const userId = req.user.id;

        const { variantId } = req.params;

        const cart = await cartService.removeItem(
            userId,
            variantId
        );

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await cartService.clearCart(userId);

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
};
const variantService = require("../services/variant.service");


const updateStock = async (req, res) => {
    
    //console.log("variantService.updateStock:", typeof variantService.updateStock);
    try {
        const { variantId } = req.params;
        const { stock } = req.body;

        const variant = await variantService.updateStock(
            variantId,
            stock
        );

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            variant,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const increaseStock = async (req, res) => {
    try {
        const { variantId } = req.params;
        const { quantity } = req.body;

        const variant = await variantService.increaseStock(
            variantId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Stock increased successfully",
            variant,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const decreaseStock = async (req, res) => {
    try {
        const { variantId } = req.params;
        const { quantity } = req.body;

        const variant = await variantService.decreaseStock(
            variantId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Stock decreased successfully",
            variant,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getLowStock = async (req, res) => {
    try {
        const limit = req.query.limit || 5;

        const variants = await variantService.getLowStock(limit);

        res.status(200).json({
            success: true,
            variants,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getOutOfStock = async (req, res) => {
    try {
        const variants = await variantService.getOutOfStock();

        res.status(200).json({
            success: true,
            variants,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    updateStock,
    increaseStock,
    decreaseStock,
    getLowStock,
    getOutOfStock,
};
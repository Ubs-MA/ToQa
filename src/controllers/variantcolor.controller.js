const ProductVariantColor = require('../models/productVariantColor');

// Get all variant colors
const getAllVariantColors = async (req, res) => {
    try {
        const colors = await ProductVariantColor.find();
        res.status(200).json({
            success: true,
            data: colors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch variant colors",
            error: error.message
        });
    }
};

// Create a new variant color
const createVariantColor = async (req, res) => {
    try {
        const { name } = req.body;
        const variantColor = await ProductVariantColor.create({ name });
        res.status(201).json({
            success: true,
            data: variantColor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create variant color",
            error: error.message
        });
    }
};

// Get a single variant color by ID
const getVariantColorById = async (req, res) => {
    try {
        const { id } = req.params;
        const variantColor = await ProductVariantColor.findById(id);
        if (!variantColor) {
            return res.status(404).json({
                success: false,
                message: "Variant color not found"
            });
        }
        res.status(200).json({
            success: true,
            data: variantColor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch variant color",
            error: error.message
        });
    }
};

// Update a variant color by ID
const updateVariantColor = async (req, res) => {
    try {
        const { id } = req.params;
        const variantColor = await ProductVariantColor.findByIdAndUpdate(
            id, 
            req.body, 
            { returnDocument: 'after' }
        );
        if (!variantColor) {
            return res.status(404).json({
                success: false,
                message: "Variant color not found"
            });
        }
        res.status(200).json({
            success: true,
            data: variantColor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update variant color",
            error: error.message
        });
    }
};

// Delete
const deleteVariantColor = async (req, res) => {
    try {
        const { id } = req.params;
        const variantColor = await ProductVariantColor.findByIdAndDelete(id);
        if (!variantColor) {
            return res.status(404).json({
                success: false,
                message: "Variant color not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Variant color deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete variant color",
            error: error.message
        });
    }
};

module.exports = {
    getAllVariantColors,
    createVariantColor,
    getVariantColorById,
    updateVariantColor,
    deleteVariantColor
};
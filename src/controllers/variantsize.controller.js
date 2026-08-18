const ProductVariantSize = require('../models/productVariantSize');

// Get all variant sizes
const getAllVariantSizes = async (req, res) => {
    try {
        const sizes = await ProductVariantSize.find();
        res.status(200).json({
            success: true,
            data: sizes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch variant sizes",
            error: error.message
        });
    }
};

// Create a new variant size
const createVariantSize = async (req, res) => {
    try {
        const { name } = req.body;
        const variantSize = await ProductVariantSize.create({ name });
        res.status(201).json({
            success: true,
            data: variantSize
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create variant size",
            error: error.message
        });
    }
};

// Get a single variant size by ID
const getVariantSizeById = async (req, res) => {
    try {
        const { id } = req.params;
        const variantSize = await ProductVariantSize.findById(id);
        if (!variantSize) {
            return res.status(404).json({
                success: false,
                message: "Variant size not found"
            });
        }
        res.status(200).json({
            success: true,
            data: variantSize
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch variant size",
            error: error.message
        });
    }
};

// Update a variant size by ID
const updateVariantSize = async (req, res) => {
    try {
        const { id } = req.params;
        const variantSize = await ProductVariantSize.findByIdAndUpdate(
            id,
            req.body,
            { returnDocument: 'after' }
        );
        if (!variantSize) {
            return res.status(404).json({
                success: false,
                message: "Variant size not found"
            });
        }
        res.status(200).json({
            success: true,
            data: variantSize
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update variant size",
            error: error.message
        });
    }
};

// Delete a variant size by ID
const deleteVariantSize = async (req, res) => {
    try {
        const { id } = req.params;
        const variantSize = await ProductVariantSize.findByIdAndDelete(id);
        if (!variantSize) {
            return res.status(404).json({
                success: false,
                message: "Variant size not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Variant size deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete variant size",
            error: error.message
        });
    }
};

module.exports = {
    getAllVariantSizes,
    createVariantSize,
    getVariantSizeById,
    updateVariantSize,
    deleteVariantSize
};
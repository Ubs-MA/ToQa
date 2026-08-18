const ProductVariant = require("../models/productVariant");
const Product = require("../models/Product");
const ProductVariantColor = require("../models/productVariantColor");
const ProductVariantSize = require("../models/productVariantSize");

// Get all variants
const getVariants = async (req, res) => {
    try {
        const variants = await ProductVariant.find({ isActive: true })
            .populate("product")
            .populate("size")
            .populate("color");

        res.status(200).json({
            success: true,
            data: variants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch variants",
            error: error.message
        });
    }
};

// Get variant by ID
const getVariantById = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findById(id)
            .populate("product")
            .populate("size")
            .populate("color");

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: variant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch variant",
            error: error.message
        });
    }
};

// Create variant
const createVariant = async (req, res) => {
    try {
        let {
            product,
            size,
            color,
            sku,
            price,
            stock
        } = req.body;

        const existingProduct = await Product.findById(product);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const existingVariantColor = await ProductVariantColor.findById(color);
        if (!existingVariantColor) {
            return res.status(404).json({
                success: false,
                message: "Variant color not found"
            });
        }

        const existingVariantSize = await ProductVariantSize.findById(size);
        if (!existingVariantSize) {
            return res.status(404).json({
                success: false,
                message: "Variant size not found"
            });
        }

        const productCode = existingProduct.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const colorCode = existingVariantColor.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const sizeCode = existingVariantSize.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        
        sku = sku || `${productCode}-${sizeCode}-${colorCode}`;

        const variant = await ProductVariant.create({
            product,
            size,
            color,
            sku,
            price,
            stock
        });

        res.status(201).json({
            success: true,
            data: variant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create variant",
            error: error.message
        });
    }
};

// Update variant
const updateVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findByIdAndUpdate(
            id,
            req.body,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: variant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update variant",
            error: error.message
        });
    }
};

// Delete / deactivate variant
const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;

        const variant = await ProductVariant.findByIdAndUpdate(
            id,
            { isActive: false },
            { returnDocument: 'after' }
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Variant deactivated successfully",
            data: variant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to deactivate variant",
            error: error.message
        });
    }
};

// Update stock of a variant
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const variant = await ProductVariant.findByIdAndUpdate(
            id,
            { stock },
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: variant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update stock",
            error: error.message
        });
    }
};

module.exports = {
    getVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    updateStock
};
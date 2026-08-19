const ProductVariant = require("../models/ProductVariant");



const updateStock = async (variantId, stock) => {
    const variant = await ProductVariant.findById(variantId);

    if (!variant) {
        throw new Error("Variant not found");
    }

    if (stock < 0) {
        throw new Error("Stock cannot be negative");
    }

    variant.stock = stock;

    await variant.save();

    return variant;
};

const increaseStock = async (variantId, quantity) => {
    const variant = await ProductVariant.findById(variantId);

    if (!variant) {
        throw new Error("Variant not found");
    }
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }
    variant.stock += quantity;

    await variant.save();

    return variant;
};

const decreaseStock = async (variantId, quantity) => {
    const variant = await ProductVariant.findById(variantId);
    if(!variant) {
        throw new Error("Variant not found");
    }
    if(quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }
    if(variant.stock < quantity) {
        throw new Error("Insufficient stock");
    }
    variant.stock -= quantity;

    await variant.save();
    return variant;
};

const getLowStock = async (limit = 5) => {
    const variants = await ProductVariant.find({
        stock: { $gt: 0, $lte: limit },
        isActive: true,
    });

    return variants;
};

const getOutOfStock = async () => {
    const variants = await ProductVariant.find({
        stock: 0,
        isActive: true,
    });

    return variants;
};





module.exports = {
    updateStock,
    increaseStock,
    decreaseStock,
    getLowStock,
    getOutOfStock,
};

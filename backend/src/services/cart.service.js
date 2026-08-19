const Cart = require("../models/Cart");
const ProductVariant = require("../models/ProductVariant");
const Product  = require("../models/Product");

const getCart = async  (userId) => {
   let cart = await Cart.findOne({user: userId});
   if(!cart){
    cart = await Cart.create({
        user: userId,
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
    });
   }
   return cart;
};


const addItem = async (userId, productId, variantId, quantity) => {
    // Check product
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new Error("Product not found or inactive");
    }

    // Check variant
    const variant = await ProductVariant.findById(variantId);
    console.log("VARIANT:", variant);
console.log("VARIANT PRODUCT:", variant?.product);

    if (!variant || !variant.isActive) {
        throw new Error("Variant not found or inactive");
    }

    // Make sure variant belongs to product
    if (variant.product.toString() !== productId.toString()) {
        throw new Error("Variant does not belong to this product");
    }

    //Check stock
    if (variant.stock < quantity) {
        throw new Error("Insufficient stock");
    }

    //Get user's cart
    const cart = await getCart(userId);

    //Check if item already exists
    const existingItem = cart.items.find(
        (item) => item.variant.toString() === variantId.toString()
    );

    if (existingItem) {
        if (variant.stock < existingItem.quantity + quantity) {
            throw new Error("Insufficient stock");
        }

        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            variant: variantId,
            quantity,
        });
    }

    //Calculate subtotal
    cart.subtotal = 0;

    for (const item of cart.items) {
        const itemVariant = await ProductVariant.findById(item.variant);

        cart.subtotal += itemVariant.price * item.quantity;
    }

    //Calculate total
    cart.total = cart.subtotal - cart.discount;
cart
    await cart.save();

    return cart;
};

const updateItem = async (userId, variantId, quantity) => {
    const cart = await getCart(userId);
    

    const item = cart.items.find(
        (item) => item.variant.toString() === variantId.toString()
    );

    if (!item) {
        throw new Error("Item not found in cart");
    }

    const variant = await ProductVariant.findById(variantId);

    if (!variant || !variant.isActive) {
        throw new Error("Variant not found or inactive");
    }

    if (variant.stock < quantity) {
        throw new Error("Insufficient stock");
    }

    item.quantity = quantity;

    cart.subtotal = 0;

    for (const cartItem of cart.items) {
        const itemVariant = await ProductVariant.findById(cartItem.variant);

        cart.subtotal += itemVariant.price * cartItem.quantity;
    }

    cart.total = cart.subtotal - cart.discount;

    await cart.save();

    return cart;
};

const removeItem = async (userId, variantId) => {
    const cart = await getCart(userId);

    const itemIndex = cart.items.findIndex(
        (item) => item.variant.toString() === variantId.toString()
    );

    if (itemIndex === -1) {
        throw new Error("Item not found in cart");
    }

    cart.items.splice(itemIndex, 1);

    cart.subtotal = 0;

    for (const item of cart.items) {
        const variant = await ProductVariant.findById(item.variant);

        cart.subtotal += variant.price * item.quantity;
    }

    cart.total = cart.subtotal - cart.discount;

    await cart.save();

    return cart;
};

const clearCart = async (userId) => {
    const cart = await getCart(userId);

    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.total = 0;

    await cart.save();

    return cart;
};
module.exports = {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart
};


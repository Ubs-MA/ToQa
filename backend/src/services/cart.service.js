const crypto = require("crypto");
const Cart = require("../models/Cart");
const ProductVariant = require("../models/ProductVariant");
const ApiError = require("../utils/ApiError");
const { validateCoupon } = require("./coupon.service");

const ownerFromRequest = (req) => {
  if (req.user) return { filter: { user: req.user._id }, create: { user: req.user._id }, sessionId: null };
  const sessionId = req.headers["x-session-id"] || crypto.randomUUID();
  return { filter: { sessionId }, create: { sessionId }, sessionId };
};

const populateCart = (query) => query
  .populate("items.product", "name slug images basePrice isActive")
  .populate("items.variant", "size color sku price stock isActive")
  .populate("coupon", "code type value expiresAt usageLimit usageCount minimumOrderAmount isActive");

const recalculate = async (cart) => {
  await cart.populate([
    { path: "items.product", select: "name slug images basePrice isActive" },
    { path: "items.variant", select: "size color sku price stock isActive" },
    { path: "coupon", select: "code type value expiresAt usageLimit usageCount minimumOrderAmount isActive" },
  ]);
  let subtotal = 0;
  for (const item of cart.items) {
    if (!item.product || !item.variant || !item.product.isActive || !item.variant.isActive) throw new ApiError(409, "A cart item is no longer available");
    if (item.quantity > item.variant.stock) throw new ApiError(409, `Only ${item.variant.stock} units are available for ${item.product.name}`);
    subtotal += (item.variant.price ?? item.product.basePrice) * item.quantity;
  }
  let discount = 0;
  if (cart.coupon) {
    try {
      ({ discount } = await validateCoupon(cart.coupon.code, subtotal));
    } catch (error) {
      cart.coupon = null;
    }
  }
  cart.subtotal = subtotal;
  cart.discount = discount;
  cart.total = Math.max(subtotal - discount, 0);
  await cart.save();
  return cart;
};

const getCart = async (owner) => {
  let cart = await Cart.findOne(owner.filter);
  if (!cart) cart = await Cart.create({ ...owner.create, items: [] });
  await recalculate(cart);
  return populateCart(Cart.findById(cart._id)).lean();
};

const addItem = async (owner, variantId, quantity) => {
  const variant = await ProductVariant.findOne({ _id: variantId, isActive: true }).populate("product");
  if (!variant || !variant.product?.isActive) throw new ApiError(404, "Product variant not found");
  if (variant.stock < quantity) throw new ApiError(409, `Only ${variant.stock} units are available`);
  let cart = await Cart.findOne(owner.filter);
  if (!cart) cart = await Cart.create({ ...owner.create, items: [] });
  const existing = cart.items.find((item) => item.variant.toString() === variantId);
  if (existing) {
    if (existing.quantity + quantity > variant.stock) throw new ApiError(409, `Only ${variant.stock} units are available`);
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: variant.product._id, variant: variant._id, quantity });
  }
  await recalculate(cart);
  return populateCart(Cart.findById(cart._id)).lean();
};

const updateItem = async (owner, variantId, quantity) => {
  const cart = await Cart.findOne(owner.filter);
  if (!cart) throw new ApiError(404, "Cart not found");
  const item = cart.items.find((entry) => entry.variant.toString() === variantId);
  if (!item) throw new ApiError(404, "Cart item not found");
  const variant = await ProductVariant.findById(variantId);
  if (!variant || !variant.isActive || variant.stock < quantity) throw new ApiError(409, `Only ${variant?.stock || 0} units are available`);
  item.quantity = quantity;
  await recalculate(cart);
  return populateCart(Cart.findById(cart._id)).lean();
};

const removeItem = async (owner, variantId) => {
  const cart = await Cart.findOne(owner.filter);
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.items = cart.items.filter((item) => item.variant.toString() !== variantId);
  await recalculate(cart);
  return populateCart(Cart.findById(cart._id)).lean();
};

const clearCart = async (owner) => {
  const cart = await Cart.findOne(owner.filter);
  if (!cart) return null;
  cart.items = [];
  cart.coupon = null;
  cart.subtotal = 0;
  cart.discount = 0;
  cart.total = 0;
  await cart.save();
  return cart;
};

const applyCoupon = async (owner, code) => {
  const cart = await Cart.findOne(owner.filter);
  if (!cart || !cart.items.length) throw new ApiError(400, "Cart is empty");
  await recalculate(cart);
  const { coupon } = await validateCoupon(code, cart.subtotal);
  cart.coupon = coupon._id;
  await recalculate(cart);
  return populateCart(Cart.findById(cart._id)).lean();
};

const removeCoupon = async (owner) => {
  const cart = await Cart.findOne(owner.filter);
  if (!cart) throw new ApiError(404, "Cart not found");
  cart.coupon = null;
  await recalculate(cart);
  return populateCart(Cart.findById(cart._id)).lean();
};

module.exports = { ownerFromRequest, getCart, addItem, updateItem, removeItem, clearCart, applyCoupon, removeCoupon, recalculate };

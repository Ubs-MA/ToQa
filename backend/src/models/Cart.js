const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    items: { type: [cartItemSchema], default: [] },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Cart", cartSchema);

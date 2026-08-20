const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, unique: true, uppercase: true },
    price: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productVariantSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });

module.exports = mongoose.model("ProductVariant", productVariantSchema);

const mongoose = require('mongoose');

/**
 * Minimal Product model — kept small since the product catalog module
 * is out of scope here. Only fields needed for checkout stock/price
 * validation are included.
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

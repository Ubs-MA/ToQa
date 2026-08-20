const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    images: [{ type: String, trim: true }],
    basePrice: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);

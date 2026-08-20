const mongoose = require("mongoose");
const colorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  hex: { type: String, trim: true, match: /^#[0-9a-fA-F]{6}$/ },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("Color", colorSchema);

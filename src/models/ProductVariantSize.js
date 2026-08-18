const mongoose = require("mongoose");
const ProductVariantSizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("ProductVariantSize", ProductVariantSizeSchema);
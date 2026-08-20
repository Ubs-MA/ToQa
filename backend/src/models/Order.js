const mongoose = require("mongoose");
const ORDER_STATUS = require("../constants/orderStatus");
const PAYMENT_STATUS = require("../constants/paymentStatus");
const PAYMENT_METHODS = require("../constants/paymentMethods");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, default: null },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, trim: true, lowercase: true },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    deliveryAddress: { type: String, required: true },
    governorate: { type: String, required: true },
    deliveryNotes: { type: String, trim: true },
    orderNotes: { type: String, trim: true },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHODS), required: true },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    paymentReference: { type: String, trim: true },
    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

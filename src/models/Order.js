const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

const PAYMENT_METHODS = ['cash_on_delivery', 'electronic_wallet'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         customer: { type: string }
 *         phone: { type: string }
 *         governorate: { type: string }
 *         address: { type: string }
 *         deliveryNotes: { type: string }
 *         paymentMethod: { type: string, enum: [cash_on_delivery, electronic_wallet] }
 *         paymentStatus: { type: string, enum: [pending, paid, failed, refunded] }
 *         status: { type: string, enum: [pending, confirmed, processing, shipped, delivered, cancelled] }
 *         totalPrice: { type: number }
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Customer information collected at checkout
    phone: { type: String, required: true, trim: true },
    governorate: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    deliveryNotes: { type: String, trim: true, default: '' },
    orderNotes: { type: String, trim: true, default: '' },

    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },

    itemsPrice: { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, required: true, min: 0, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    // Payment
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    paymentReference: { type: String, default: null },
    paymentProof: { type: String, default: null }, // uploaded receipt/screenshot path

    // Order status
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: { type: [statusHistorySchema], default: [] },
    cancelReason: { type: String, trim: true, default: null },
    cancelledAt: { type: Date, default: null }
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

orderSchema.pre('validate', function generateOrderNumber(next) {
  if (!this.orderNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${Date.now()}-${rand}`;
  }
  next();
});

orderSchema.statics.STATUSES = ORDER_STATUSES;
orderSchema.statics.PAYMENT_METHODS = PAYMENT_METHODS;
orderSchema.statics.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

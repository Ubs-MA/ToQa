const calculateOrderTotals = ({ subtotal, discount = 0, shippingFee = 0 }) => ({
  subtotal,
  discount,
  shippingFee,
  total: Math.max(subtotal - discount + shippingFee, 0),
});

module.exports = calculateOrderTotals;

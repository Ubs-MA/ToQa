const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  const discount = coupon.type === "percentage"
    ? subtotal * (coupon.value / 100)
    : coupon.value;
  return Math.min(Math.max(discount, 0), subtotal);
};

module.exports = calculateDiscount;

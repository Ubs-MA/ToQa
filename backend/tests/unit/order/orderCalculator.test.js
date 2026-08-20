const calculateOrderTotals = require("../../../src/utils/orderCalculator");

describe("order calculator", () => {
  test("combines subtotal, discount, and shipping", () => {
    expect(calculateOrderTotals({ subtotal: 1500, discount: 200, shippingFee: 75 })).toEqual({
      subtotal: 1500, discount: 200, shippingFee: 75, total: 1375,
    });
  });
  test("never returns a negative total", () => {
    expect(calculateOrderTotals({ subtotal: 100, discount: 500 })).toEqual({
      subtotal: 100, discount: 500, shippingFee: 0, total: 0,
    });
  });
});

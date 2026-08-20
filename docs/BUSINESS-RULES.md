# ToQa Business Rules

1. Stock belongs to a product variant, never directly to a product.
2. Zero-stock variants remain visible but cannot be added to the cart.
3. Stock is checked when a cart changes and atomically reserved again during checkout.
4. The backend is authoritative for price, discount, stock, and totals.
5. Low stock means an active variant with stock from zero through `LOW_STOCK_THRESHOLD`; the dashboard count excludes zero-stock variants while the inventory list includes them.
6. Coupon validation checks active status, expiry, usage limit, minimum order amount, and discount bounds.
7. Coupon usage increases only after an order is created.
8. Customers may cancel only pending or confirmed orders. Cancellation restores stock.
9. Sales equal paid, non-cancelled order totals.
10. Wallet payment stores a customer-provided reference; no external payment gateway is used.
11. Wishlist and reviews require authentication.
12. A review requires a delivered order containing the product, and each customer can review a product once.
13. Guest orders are not linked retroactively to accounts created later.
14. Deletion of operational records uses deactivation where history must be preserved.

# QA and Release Checklist

## Automated gates

- [x] Backend JavaScript syntax check
- [x] Jest unit and health integration tests
- [x] Frontend production build
- [x] Backend and frontend dependency audit with no known vulnerabilities
- [x] OpenAPI YAML and Postman JSON parsing
- [ ] GitHub Actions passes on the pull request

## Manual API regression

- [ ] Register, login, logout, and `/auth/me`
- [ ] Customer receives `403` from `/admin/dashboard`
- [ ] Admin receives dashboard metrics
- [ ] Search, category, price, size, colour, availability, sorting, and pagination work together
- [ ] Zero-stock variant cannot be added to cart
- [ ] Quantity above stock returns `409`
- [ ] Guest cart retains the returned `x-session-id`
- [ ] Coupon expiry, limit, and minimum amount are enforced
- [ ] Checkout revalidates stock and clears the cart
- [ ] Pending/confirmed cancellation restores stock
- [ ] Customer cannot view another customer's order
- [ ] Review is rejected without a delivered purchase
- [ ] Deactivated products disappear from the public catalog
- [ ] Product upload rejects invalid type and oversized files

## Frontend regression

- [ ] Customer flow works at mobile and desktop widths
- [ ] Loading, empty, error, and unauthorized states are readable
- [ ] Guest checkout works without registration
- [ ] Login persists across refresh
- [ ] Wishlist item moves to cart
- [ ] Order tracking shows the current status
- [ ] Every admin navigation section loads
- [ ] Admin create, update, deactivate, and moderation controls work

## Release

- [ ] README works from a clean clone
- [ ] `.env` and credentials are not tracked
- [ ] Postman collection variables contain no real secrets
- [ ] Swagger loads at `/api-docs`
- [ ] `develop` is stable before the final pull request into `main`

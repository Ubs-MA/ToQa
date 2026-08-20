# ToQa Backend

## Commands

- `npm run dev` — start with nodemon
- `npm start` — start normally
- `npm test` — run all Jest tests
- `npm run test:coverage` — coverage report
- `npm run seed` — upsert the demo admin, category, product, and variants

## Environment

Copy `.env.example` to `.env`. Required values are `MONGODB_URI` and `JWT_SECRET`. The real file is ignored by Git.

## Main API groups

| Prefix | Purpose |
| --- | --- |
| `/api/v1/auth` | Register, login, logout, current user |
| `/api/v1/users` | Customer profile and password |
| `/api/v1/products` | Product listing, detail, variants, reviews |
| `/api/v1/categories` | Public categories |
| `/api/v1/cart` | Guest/customer cart and coupons |
| `/api/v1/checkout` | Final validation and order creation |
| `/api/v1/orders` | Customer history, detail, cancellation |
| `/api/v1/wishlist` | Authenticated wishlist |
| `/api/v1/reviews` | Customer review updates/removal |
| `/api/v1/admin` | Dashboard and management APIs |

Protected requests accept `Authorization: Bearer <token>`. Guest carts use `x-session-id`; the server returns this header when it creates a session.

Interactive documentation: `/api-docs`.

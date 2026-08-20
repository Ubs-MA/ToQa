# Checkout + Orders + Payment API

A backend module implementing **Checkout**, **Orders**, and **Payment**, built with:

Node.js · Express.js · MongoDB + Mongoose · JWT Authentication · express-validator ·
centralized error handling · REST API · environment variables · Role-Based Authorization ·
file upload (Multer) · pagination · search & filter · logging (Winston + Morgan) ·
Swagger / OpenAPI docs · Docker · Jest unit tests.

## Features

### Checkout
- Collects customer phone, governorate, address, delivery/order notes, and payment method.
- Performs **final stock validation** against live product data (never trusts client-sent prices/stock).
- Performs **final price calculation** server-side (items price + shipping).
- Creates the order and decrements product stock atomically (Mongo transaction).

### Payment
- **Cash on Delivery** — order is created with `paymentStatus: pending`, collected on delivery.
- **Electronic Wallet** — a mock payment gateway (`src/utils/paymentService.js`) generates a payment
  reference; customer can upload a payment proof (receipt/screenshot); admin confirms/updates payment status.
- Payment status: `pending | paid | failed | refunded`.

### Orders
- Create order (via Checkout), get customer's own orders, get order details, admin list-all,
  update order status (with status history log), cancel order / view cancellation reason.
- Pagination, search, filtering and sorting supported on all list endpoints via query params.

### Cross-cutting
- JWT auth (`Authorization: Bearer <token>`) + role-based authorization (`customer`, `admin`).
- express-validator on every write endpoint; centralized error handler normalizes Mongoose/JWT/Multer errors.
- Winston file logging (`logs/`) + Morgan HTTP request logging piped into Winston.
- Swagger UI at `/api-docs`.

## Project structure

```
src/
  config/        # db, logger, swagger
  middlewares/    # auth, role, validate, upload, errorHandler
  models/         # User, Product (minimal), Order
  controllers/    # checkoutController, orderController, paymentController
  routes/         # authRoutes, checkoutRoutes, orderRoutes
  validations/    # express-validator rule sets
  utils/          # ApiError, catchAsync, apiFeatures (pagination/search/filter), paymentService
  app.js          # Express app assembly
  server.js       # entrypoint (loads env, connects DB, starts server)
tests/            # Jest + Supertest + mongodb-memory-server
postman/          # Postman collection
```

> Note: `User` and `Product` models here are intentionally minimal — just enough to support
> checkout's authentication and stock/price validation. A full auth/catalog module is out of scope.

## Getting started

```bash
cp .env.example .env      # then edit values (MONGO_URI, JWT_SECRET, ...)
npm install
npm run dev                # nodemon, http://localhost:5000
```

Swagger docs: `http://localhost:5000/api-docs`
Health check: `GET /health`

## Running with Docker

```bash
docker compose up --build
```

This starts the API container plus a MongoDB container. The API will be available on
`http://localhost:5000`.

## Running tests

```bash
npm test
```

Tests use `mongodb-memory-server` to spin up an ephemeral in-memory MongoDB instance, so no
external database is required — just internet access the first time it downloads the `mongod`
binary (cached afterwards). Covers checkout stock/price validation, RBAC on orders, status
transitions, cancellation rules, and payment status flows.

## API overview

All routes are prefixed with `/api/v1`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register (helper endpoint to obtain a JWT) |
| POST | `/auth/login` | Public | Log in, receive JWT |
| POST | `/checkout` | Customer/Admin | Submit checkout, create order |
| GET | `/orders/my-orders` | Customer | List own orders (pagination/search/filter) |
| GET | `/orders/:id` | Owner or Admin | Order details |
| PATCH | `/orders/:id/cancel` | Owner or Admin | Cancel order |
| POST | `/orders/:id/payment-proof` | Owner | Upload payment proof file |
| GET | `/orders/:id/payment-status` | Owner or Admin | Get payment status |
| GET | `/orders` | Admin | List all orders (pagination/search/filter) |
| PATCH | `/orders/:id/status` | Admin | Update order status |
| PATCH | `/orders/:id/payment-status` | Admin | Confirm/update payment status |

### Pagination, search & filter query params (list endpoints)
- `page`, `limit` — pagination
- `sort` — e.g. `sort=-createdAt` or `sort=totalPrice`
- `fields` — e.g. `fields=orderNumber,status,totalPrice`
- `search` — free-text match against order number / address / governorate / phone
- Any order field for exact filtering, e.g. `status=pending&governorate=Cairo`
- Range filters: `totalPrice[gte]=100&totalPrice[lte]=500`

## Order & payment status values

- `status`: `pending → confirmed → processing → shipped → delivered` (or `cancelled` at any point up to shipping)
- `paymentMethod`: `cash_on_delivery | electronic_wallet`
- `paymentStatus`: `pending | paid | failed | refunded`

## Postman

Import `postman/Checkout-Orders-Payment.postman_collection.json`. Set the collection variable
`baseUrl` (default `http://localhost:5000/api/v1`), then run **Auth → Register** for a customer and
an admin, paste the returned tokens into `customerToken` / `adminToken`, and set `productId` to a
product `_id` in your database.

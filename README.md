# ToQa

ToQa is a full-stack, single-store e-commerce platform for modest clothing. It supports guest and registered shopping, variant-level inventory, stock-safe checkout, coupons, wallet/COD payment records, orders, wishlist, verified-purchase reviews, and a role-protected admin workspace.

## Stack

- Backend: Node.js 22, Express 5, MongoDB, Mongoose, JWT, express-validator
- Frontend: React, Vite, React Router
- QA: Jest, Supertest, Postman, Swagger/OpenAPI, GitHub Actions

## Quick start

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. In `backend`, run `npm ci`, then `npm run dev`.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. In `frontend`, run `npm ci`, then `npm run dev`.
5. Open `http://localhost:5173`. API docs are at `http://localhost:5000/api-docs`.

To create demo data and an admin, set `ADMIN_SEED_PASSWORD` in `backend/.env`, then run `npm run seed` inside `backend`.

## Project structure

- `backend/src/models` — Mongoose domain models
- `backend/src/services` — business rules and database operations
- `backend/src/controllers` — HTTP request/response handling
- `backend/src/routes` — `/api/v1` route definitions
- `backend/tests` — unit and integration tests
- `frontend/src` — storefront and admin React application
- `docs` — business rules, Git workflow, and Postman collection

## Important rules

- Never commit `.env` files or real credentials.
- All prices and stock are recalculated and validated by the backend.
- Feature branches merge into `develop`; only stable releases merge into `main`.
- Guest orders are not retroactively linked when a guest later registers.

See [backend/README.md](backend/README.md) for the API route map and [docs/BUSINESS-RULES.md](docs/BUSINESS-RULES.md) for the agreed domain rules.

Additional handoff material: [architecture](docs/ARCHITECTURE.md), [QA checklist](docs/QA-CHECKLIST.md), [Git workflow](docs/GIT-WORKFLOW.md), and the importable Postman collection in `docs/postman`.

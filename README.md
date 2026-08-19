# ToQa
ToQa — A Single-Store E-Commerce Platform for Modest Clothing

## Backend — Auth, Users & Security

This branch implements authentication, user profiles, role-based
authorization, and the related security middleware for the backend API.

### Requirements

- Node.js 18+
- MongoDB (local install, or run `docker compose up -d mongo`)

### Setup

```bash
npm install
cp .env.example .env   # then fill in real values, especially JWT_SECRET
npm run dev             # starts the API with nodemon on http://localhost:5000
```

### Testing

```bash
npm test
```

API docs (Swagger UI) are served at `/api/docs` once the server is running.

See `src/docs/openapi.yaml` for the full OpenAPI spec covering
`/api/v1/auth`, `/api/v1/users`, and `/api/v1/admin/users`.


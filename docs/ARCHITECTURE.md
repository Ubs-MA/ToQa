# Architecture

ToQa uses a conventional layered monolith. The storefront and admin workspace share one React application and one versioned REST API.

```mermaid
flowchart TD
  UI[React storefront and admin] --> API[Express /api/v1]
  API --> MW[Validation, JWT, roles, rate limits]
  MW --> CTRL[Controllers]
  CTRL --> SVC[Business services]
  SVC --> ODM[Mongoose models]
  ODM --> DB[(MongoDB)]
```

Controllers translate HTTP input and output. Services own totals, coupon rules, stock reservation, authorization-sensitive queries, and order transitions. Models enforce persistence constraints. Cross-cutting middleware handles authentication, authorization, validation, uploads, logging, not-found responses, and centralized errors.

## Checkout sequence

```mermaid
sequenceDiagram
  participant C as Customer
  participant API as Checkout API
  participant DB as MongoDB
  C->>API: Delivery and payment details
  API->>DB: Reload cart and authoritative prices
  API->>DB: Validate coupon
  API->>DB: Atomically decrement each variant
  API->>DB: Create order snapshot
  API->>DB: Clear cart and increment coupon usage
  API-->>C: Confirmed order
```

If any stock reservation or order creation step fails, already-reserved quantities are restored. Customer and admin cancellation also restores stock exactly once.

## Security boundaries

- Customer and admin identity comes only from a verified JWT.
- `/admin/*` requires both authentication and the `admin` role.
- Password hashes are excluded from normal Mongoose queries.
- Uploaded images are limited to JPEG, PNG, or WebP and 5 MB.
- The API never accepts cart totals or authoritative prices from the client.
- Secrets are loaded from environment variables and excluded from Git.

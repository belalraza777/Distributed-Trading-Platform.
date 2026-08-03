# API Gateway

TypeScript + Express API Gateway for the **Distributed Trading Platform**. It acts as the single entry point for client requests, forwarding them to the appropriate microservice while providing request routing, distributed rate limiting, request validation, and centralized error handling.

---

# Features

* Request Routing
* Reverse Proxy
* Distributed Rate Limiting (Redis)
* Request Validation (Joi)
* Centralized Error Handling
* Health Check Endpoint

---

# Tech Stack

* TypeScript
* Express.js
* http-proxy-middleware
* Redis
* ioredis
* express-rate-limit
* rate-limit-redis
* Joi

---

# Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the gateway in development mode |
| `npm run build` | Compile TypeScript into `dist/`       |
| `npm run start` | Run the compiled gateway              |

---

# Gateway Routes

| Gateway Route              | Target Service       |
| -------------------------- | -------------------- |
| `GET /`                    | Gateway Status       |
| `GET /api/health`          | Gateway Health Check |
| `ALL /api/auth/*`          | Auth Service         |
| `ALL /api/market-data/*`   | Market Data Service  |
| `ALL /api/orders/*`        | Order Service        |
| `ALL /api/portfolio/*`     | Portfolio Service    |
| `ALL /api/wallet/*`        | Wallet Service       |
| `ALL /api/notifications/*` | Notification Service |

---

# Service Endpoints

## Auth Service

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
GET  /api/auth/health
```

---

## Market Data Service

```http
GET    /api/market-data
GET    /api/market-data/search
GET    /api/market-data/:symbol
GET    /api/market-data/:symbol/price
GET    /api/market-data/:symbol/history

POST   /api/market-data
POST   /api/market-data/:symbol/price

PUT    /api/market-data/:id
DELETE /api/market-data/:id
```

---

## Portfolio Service

```http
GET /api/portfolio
GET /api/portfolio/:symbol
```

---

## Wallet Service

```http
GET  /api/wallet/balance
POST /api/wallet/deposit
POST /api/wallet/verify-payment
POST /api/wallet/withdraw
GET  /api/wallet/transactions
```

---

## Order Service

```http
GET  /api/orders
GET  /api/orders/:id

POST /api/orders
POST /api/orders/:id/cancel
```

---

## Notification Service

```http
GET /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

# Authentication & Authorization

The API Gateway **does not perform authentication or authorization**.

Instead, it forwards incoming requests, including headers and cookies, to the appropriate microservice.

Each microservice is responsible for:

* JWT validation
* User authentication
* Role-based authorization
* Protecting its own endpoints

This keeps services independent and allows each service to enforce its own security.

---

# Distributed Rate Limiting

The gateway uses **Redis** with **express-rate-limit** to provide distributed rate limiting.

| Route          |         Limit | Window     |
| -------------- | ------------: | ---------- |
| Authentication |   10 requests | 10 minutes |
| Market Data    | 1000 requests | 10 minutes |
| Orders         |  200 requests | 10 minutes |
| Portfolio      |  300 requests | 10 minutes |
| Wallet         |  150 requests | 10 minutes |
| Notifications  |  100 requests | 10 minutes |

### Benefits

* Shared rate-limit counters using Redis
* Consistent limits across multiple gateway instances
* Automatic expiration of rate-limit counters
* High-performance in-memory storage

---

# Environment Variables

```env
PORT=3000

AUTH_SERVICE_URL=http://localhost:3001
MARKET_DATA_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
PORTFOLIO_SERVICE_URL=http://localhost:3005
WALLET_SERVICE_URL=http://localhost:3006

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

---

# Project Structure

```text
src/
│
├── config/
│   ├── redis.ts
│   └── proxy.ts
│
├── middleware/
│   ├── rate.limiter.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
│
├── routes/
├── utils/
│
├── app.ts
└── server.ts
```

---

# Health Check

```http
GET /api/health
```

Response

```json
{
  "success": true,
  "message": "API Gateway is running"
}
```

---

# Request Flow

```text
                Client
                   │
                   ▼
             API Gateway
        ┌─────────────────────┐
        │ Request Validation  │
        │ Redis Rate Limiter  │
        │ Route Proxy         │
        └─────────────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
 Auth Service  Order Service  Wallet Service
      │            │            │
      ▼            ▼            ▼
 Portfolio   Market Data  Notification

Each microservice independently:
✔ Validates JWT
✔ Authorizes users
✔ Executes business logic
```

This version documents only the features you've actually implemented and avoids mentioning Docker or any other technologies that aren't yet part of the project.

# Trading Microservices

A stock trading platform built as a collection of Node.js microservices. Users can register, fund a wallet, browse market data, place buy/sell orders, track portfolio holdings, and receive notifications — all through a single API gateway.

## Architecture

```mermaid
flowchart TB
    Client([Client / Frontend])

    subgraph gateway [API Gateway :3000]
        GW[Express + HTTP Proxy]
    end

    subgraph services [Microservices]
        AUTH[auth-service :3001]
        MARKET[market-data-service :3002]
        NOTIFY[notification-service :3003]
        ORDER[order-service :3004]
        PORTFOLIO[portfolio-service :3005]
        WALLET[wallet-service :3006]
    end

    subgraph infra [Infrastructure]
        PG[(PostgreSQL)]
        RMQ[(RabbitMQ)]
    end

    Client --> GW
    GW --> AUTH
    GW --> MARKET
    GW --> NOTIFY
    GW --> ORDER
    GW --> PORTFOLIO
    GW --> WALLET

    AUTH --> PG
    MARKET --> PG
    NOTIFY --> PG
    ORDER --> PG
    PORTFOLIO --> PG
    WALLET --> PG

    ORDER -->|HTTP| MARKET
    ORDER -->|HTTP| WALLET
    ORDER -->|HTTP| PORTFOLIO
    NOTIFY -->|HTTP| AUTH

    ORDER -->|order.executed| RMQ
    ORDER -->|wallet.deposit.requested| RMQ
    WALLET -->|payment.notification| RMQ
    MARKET -->|order.price.updated| RMQ

    RMQ --> PORTFOLIO
    RMQ --> WALLET
    RMQ --> NOTIFY
```

Each service owns its own PostgreSQL database (database-per-service pattern). Cross-service communication uses synchronous HTTP for request/response flows and RabbitMQ for async events.

## Services

| Service | Port | Responsibility |
| --- | --- | --- |
| [api-gateway](./api-gateway) | 3000 | Single HTTP entry point, request proxying, security headers |
| [auth-service](./auth-service) | 3001 | User registration, login, JWT issuance, roles (`USER` / `ADMIN`) |
| [market-data-service](./market-data-service) | 3002 | Stock catalog, live prices, price history |
| [notification-service](./notification-service) | 3003 | In-app notifications (email/SMS workers stubbed) |
| [order-service](./order-service) | 3004 | Buy/sell order placement, execution, cancellation |
| [portfolio-service](./portfolio-service) | 3005 | Holdings, average cost, P&L |
| [wallet-service](./wallet-service) | 3006 | Deposits, withdrawals, balance, Razorpay integration |
| [admin-service](./admin-service) | 3007 | Admin dashboard, user bans, and order administration |

## Tech Stack

- **Runtime:** Node.js, TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (one database per service)
- **Messaging:** RabbitMQ (`amqplib`)
- **Auth:** JWT (Bearer token or `token` cookie)
- **Payments:** INTERNAL (dev) or Razorpay (production)
- **Gateway:** `express-http-proxy`, Helmet, CORS, Morgan

## Prerequisites

- Node.js 18+
- PostgreSQL
- RabbitMQ (local or hosted, e.g. CloudAMQP)
- npm

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd "Trading Microservices"

# Install root dev dependency (concurrently)
npm install

# Install dependencies for each service
for dir in api-gateway auth-service market-data-service notification-service order-service portfolio-service wallet-service admin-service; do
  (cd "$dir" && npm install)
done
```

On Windows PowerShell:

```powershell
npm install
@("api-gateway","auth-service","market-data-service","notification-service","order-service","portfolio-service","wallet-service","admin-service") | ForEach-Object {
  Push-Location $_; npm install; Pop-Location
}
```

### 2. Create PostgreSQL databases

Create a separate database for each service:

```sql
CREATE DATABASE trading_auth_service;
CREATE DATABASE trading_market_data_service;
CREATE DATABASE trading_notification_service;
CREATE DATABASE trading_order_service;
CREATE DATABASE trading_portfolio_service;
CREATE DATABASE trading_wallet_service;
CREATE DATABASE trading_admin_service;
```

### 3. Configure environment variables

Create a `.env` file in each service directory. All services that validate JWT must share the same `JWT_SECRET`.

**Shared values (use the same across services):**

```env
JWT_SECRET=your-secret-key
INTERNAL_SERVICE_SECRET=internal-secret
RABBIT_URL=amqp://localhost
```

**Per-service examples:**

<details>
<summary>auth-service (.env)</summary>

```env
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_auth_service?schema=public"
JWT_SECRET=your-secret-key
RABBIT_URL=amqp://localhost
INTERNAL_SERVICE_SECRET=internal-secret
```

</details>

<details>
<summary>market-data-service (.env)</summary>

```env
PORT=3002
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_market_data_service?schema=public"
JWT_SECRET=your-secret-key
RABBIT_URL=amqp://localhost
```

</details>

<details>
<summary>notification-service (.env)</summary>

```env
PORT=3003
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_notification_service?schema=public"
JWT_SECRET=your-secret-key
RABBIT_URL=amqp://localhost
USER_SERVICE_URL=http://localhost:3001
INTERNAL_SERVICE_SECRET=internal-secret
```

</details>

<details>
<summary>order-service (.env)</summary>

```env
PORT=3004
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_order_service?schema=public"
JWT_SECRET=your-secret-key
RABBIT_URL=amqp://localhost
MARKET_DATA_SERVICE_URL=http://localhost:3002
PORTFOLIO_SERVICE_URL=http://localhost:3005
WALLET_SERVICE_URL=http://localhost:3006
ADMIN_SERVICE_URL=http://localhost:3007
```

</details>

<details>
<summary>portfolio-service (.env)</summary>

```env
PORT=3005
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_portfolio_service?schema=public"
JWT_SECRET=your-secret-key
RABBIT_URL=amqp://localhost
```

</details>

<details>
<summary>wallet-service (.env)</summary>

```env
PORT=3006
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_wallet_service?schema=public"
JWT_SECRET=your-secret-key
RABBIT_URL=amqp://localhost
PAYMENT_PROVIDER=INTERNAL

# Required when PAYMENT_PROVIDER=RAZORPAY
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

</details>

<details>
<summary>api-gateway (.env)</summary>

```env
PORT=3000
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://localhost:3001
MARKET_DATA_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
PORTFOLIO_SERVICE_URL=http://localhost:3005
WALLET_SERVICE_URL=http://localhost:3006
```

</details>

### 4. Run database migrations

From each service directory that uses Prisma:

```bash
npx prisma migrate deploy
npx prisma generate
```

Services with migrations: `auth-service`, `market-data-service`, `order-service`, `portfolio-service`, `wallet-service`, `admin-service`.

For `notification-service`, push the schema if no migrations exist yet:

```bash
npx prisma db push
npx prisma generate
```

### 5. Start all services

From the repository root:

```bash
npm run dev
```

This starts all eight services concurrently. You can also run them individually:

```bash
npm run gateway       # api-gateway
npm run auth          # auth-service
npm run market        # market-data-service
npm run notification  # notification-service
npm run order         # order-service
npm run portfolio     # portfolio-service
npm run wallet        # wallet-service
npm run admin         # admin-service
```

Verify the gateway is up:

```bash
curl http://localhost:3000/health
```

## Authentication

The platform uses JWT-based authentication. After login or registration, include the token on protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

Or via cookie:

```http
Cookie: token=<JWT_TOKEN>
```

**Roles:**

| Role | Description |
| --- | --- |
| `USER` | Default role — trading, wallet, portfolio access |
| `ADMIN` | Can manage stocks and record market prices |

Admin-only endpoints return `403 Forbidden` for non-admin users.

## API Overview

All client requests go through the gateway at `http://localhost:3000/api`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Create a new account |
| POST | `/login` | Public | Sign in, receive JWT |
| POST | `/logout` | Public | Invalidate token |
| GET | `/profile` | Required | Current user profile |

### Market Data — `/api/market-data`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | List all stocks |
| GET | `/:symbol` | Public | Stock details |
| GET | `/:symbol/price` | Required | Latest price |
| GET | `/:symbol/history` | Required | Price history |
| POST | `/` | Admin | Create stock |
| POST | `/:symbol/price` | Admin | Record new price |
| PUT | `/:id` | Admin | Update stock |
| DELETE | `/:id` | Admin | Delete stock |

### Wallet — `/api/wallet`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/balance` | Required | Current balance |
| POST | `/deposit` | Required | Deposit funds |
| POST | `/verify-payment` | Required | Verify Razorpay payment |
| POST | `/withdraw` | Required | Withdraw funds |
| GET | `/transactions` | Required | Transaction history |
| POST | `/webhook` | Public | Razorpay webhook (no JWT) |

Set `PAYMENT_PROVIDER=INTERNAL` for instant demo deposits, or `RAZORPAY` for real payments. See [wallet-service README](./wallet-service/README.md) for the full payment flow.

### Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/` | Required | Place a BUY or SELL order |
| GET | `/` | Required | Order history (paginated) |
| GET | `/:id` | Required | Single order |
| POST | `/:id/cancel` | Required | Cancel a pending order |

**Order request body:**

```json
{
  "symbol": "AAPL",
  "type": "BUY",
  "quantity": 10
}
```

Prices are fetched automatically from market-data-service — clients do not send a price.

### Portfolio — `/api/portfolio`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | Required | All holdings with P&L summary |
| GET | `/:symbol` | Required | Single holding |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | Required | User notification inbox |

## Order Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant O as order-service
    participant M as market-data-service
    participant W as wallet-service
    participant P as portfolio-service
    participant Q as RabbitMQ

    C->>G: POST /api/orders (BUY AAPL x10)
    G->>O: Forward request
    O->>M: GET latest price for AAPL
    M-->>O: price = 189.45
    O->>O: Create order (PENDING)
    O->>W: Withdraw funds (lock)
    O->>Q: Publish order.executed
    Q->>P: Update holdings
    O-->>C: Executed order
```

**BUY orders:** Lock funds via wallet withdraw → execute → publish `order.executed` → portfolio updates holdings.

**SELL orders:** Verify holdings via portfolio-service → execute → credit proceeds via RabbitMQ (`wallet.deposit.requested`) → publish `order.executed`.

**Cancellation:** Only `PENDING` orders can be cancelled. Locked BUY funds are refunded.

## RabbitMQ Queues

| Queue | Publisher | Consumer | Purpose |
| --- | --- | --- | --- |
| `order.executed` | order-service | portfolio-service | Update holdings after trade |
| `order.price.updated` | market-data-service | portfolio-service | Refresh current price on holdings |
| `wallet.deposit.requested` | order-service | wallet-service | Internal deposits (refunds, sale proceeds) |
| `payment.notification` | wallet-service | notification-service | Payment status alerts |
| `order.executed.notification` | *(not wired yet)* | notification-service | Order execution alerts (consumer ready) |

## Project Structure

```
Trading Microservices/
├── api-gateway/           # HTTP gateway and proxy
├── auth-service/          # Authentication and users
├── market-data-service/   # Stocks and market prices
├── notification-service/  # User notifications
├── order-service/         # Order lifecycle
├── portfolio-service/     # Holdings and P&L
├── wallet-service/        # Wallet and payments
├── package.json           # Root scripts (npm run dev)
└── README.md
```

Each service follows a similar layout:

```
service/
├── prisma/          # Schema and migrations
├── src/
│   ├── config/      # DB, RabbitMQ
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── messaging/   # RabbitMQ publishers/consumers
│   └── app.ts
├── package.json
└── tsconfig.json
```

## Service Documentation

For deeper details on individual services:

- [api-gateway](./api-gateway/README.md) — route mapping and gateway config
- [wallet-service](./wallet-service/README.md) — payment providers, Razorpay flow, webhooks
- [order-service](./order-service/README.md) — order placement logic
- [market-data-service](./market-data-service/README.md) — stock API reference

## Development

**Build a single service:**

```bash
cd order-service
npm run build
npm start
```

**Common scripts (per service):**

| Script | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |

**Health checks:**

Each service exposes `GET /health`. Through the gateway, auth routes are at `/api/auth/health` and the gateway itself at `/health`.

## Admin Service

The admin service is available directly at `http://localhost:3007` and through the gateway at `http://localhost:3000/api/admin`. All admin routes require a JWT for an `ADMIN` user.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard` | Combined user, order, and wallet statistics |
| GET | `/users` | List users |
| GET | `/users/:id` | Get a user |
| POST | `/users/:id/ban` | Ban a user; body: `{ "reason": "..." }` |
| POST | `/users/:id/unban` | Remove a ban |
| GET | `/orders` | List orders |
| GET | `/orders/:id` | Get an order |
| POST | `/orders/:id/cancel` | Force-cancel an order |

Add this configuration to `admin-service/.env`:

```env
PORT=3007
DATABASE_URL=postgresql://postgres:password@localhost:5432/trading_admin_service?schema=public
JWT_SECRET=your-secret-key
INTERNAL_SERVICE_SECRET=internal-secret
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3004
WALLET_SERVICE_URL=http://localhost:3006
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Internal Service APIs

The auth, order, and wallet services expose internal endpoints for admin-service. They require the shared `x-internal-secret` header and return `403 Forbidden` for a missing or invalid secret.

| Service | Endpoints |
| --- | --- |
| auth-service | `GET /internal/users`, `GET /internal/users/:id`, `GET /internal/stats` |
| order-service | `GET /internal/orders`, `GET /internal/orders/:id`, `POST /internal/orders/:id/cancel`, `GET /internal/stats` |
| wallet-service | `GET /internal/stats` |

When an administrator bans a user, admin-service stores the ban in `banned_users` and writes `banned:<userId>` to Redis. The API gateway checks this key before forwarding requests with a valid JWT and returns `403 Forbidden` for banned users. Unbanning removes both records.

## License

Private project — all rights reserved.

# order-service

TypeScript + Express scaffold with PostgreSQL connection.

Order placement fetches the latest market price from market-data-service. Clients do not send order prices.

The service listens on port `3004` and exposes `GET /health`. Through the gateway, the public routes are under `/api/orders`.

## Order Flow

- `POST /api/orders` receives `symbol`, `type`, and `quantity`.
- `order-service` fetches the latest price from `market-data-service`.
- BUY orders lock funds through `wallet-service` withdraw.
- SELL orders verify holdings through `portfolio-service`.
- `order-service` uses a circuit breaker for the synchronous wallet fund-lock request.
- If `wallet-service` repeatedly fails, the circuit opens and requests fail fast with `503 Service Unavailable`.
- After the reset timeout, the circuit enters half-open state and checks whether `wallet-service` has recovered.
- Internal wallet deposits for refunds and sale proceeds are sent through RabbitMQ.
- `wallet-service` consumes the queue and updates the wallet balance directly.

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Prisma: `npx prisma generate` (after `npm install`)

## Internal admin endpoints

Trusted services must include `x-internal-secret: <INTERNAL_SECRET>`. Missing or invalid secrets return `403 Forbidden`.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/internal/orders` | List all orders |
| GET | `/internal/orders/:id` | Get one order |
| POST | `/internal/orders/:id/cancel` | Force-cancel an order |
| GET | `/internal/stats` | Return total order count and volume |

Internal routes require the `x-internal-secret` header and use `INTERNAL_SECRET` from the service environment. RabbitMQ uses `RABBIT_URL`; order execution publishes `order.executed` and wallet refunds or sale proceeds publish `wallet.deposit.requested`.

## Environment

```env
PORT=3004
DATABASE_URL=postgresql://postgres:password@localhost:5432/trading_order_service?schema=public
JWT_SECRET=shared-jwt-secret
INTERNAL_SECRET=shared-internal-secret
RABBIT_URL=amqp://localhost
MARKET_DATA_SERVICE_URL=http://localhost:3002
PORTFOLIO_SERVICE_URL=http://localhost:3005
WALLET_SERVICE_URL=http://localhost:3006
```
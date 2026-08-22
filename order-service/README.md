# order-service

TypeScript + Express scaffold with PostgreSQL connection.

Order placement fetches the latest market price from market-data-service. Clients do not send order prices.

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

Trusted services must include `x-internal-secret: <INTERNAL_SERVICE_SECRET>`. Missing or invalid secrets return `403 Forbidden`.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/internal/orders` | List all orders |
| GET | `/internal/orders/:id` | Get one order |
| POST | `/internal/orders/:id/cancel` | Force-cancel an order |
| GET | `/internal/stats` | Return total order count and volume |
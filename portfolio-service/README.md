
# Portfolio Service

Portfolio service stores user holdings and updates them from executed orders and market price events.

## Run

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

The default port is `3005`. It requires PostgreSQL, RabbitMQ, and a shared `JWT_SECRET`.

## API

Routes are mounted at `/` directly and at `/api/portfolio` through the gateway. Both endpoints require a JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Paginated portfolio for the authenticated user |
| GET | `/:symbol` | Holding for one symbol |
| GET | `/health` | PostgreSQL-backed health check |

Through the gateway, use `GET /api/portfolio` and `GET /api/portfolio/:symbol`.

## RabbitMQ

The service consumes `order.executed` to apply BUY and SELL trades and `order.price.updated` to refresh current prices. Set `RABBIT_URL` to the RabbitMQ connection string.

## Environment

```env
PORT=3005
DATABASE_URL=postgresql://postgres:password@localhost:5432/trading_portfolio_service?schema=public
JWT_SECRET=shared-jwt-secret
RABBIT_URL=amqp://localhost
```

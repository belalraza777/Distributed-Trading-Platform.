# order-service

TypeScript + Express scaffold with PostgreSQL connection.

Order placement fetches the latest market price from market-data-service. Clients do not send order prices.

## Order Flow

- `POST /api/orders` receives `symbol`, `type`, and `quantity`.
- `order-service` fetches the latest price from `market-data-service`.
- BUY orders lock funds through `wallet-service` withdraw.
- SELL orders verify holdings through `portfolio-service`.
- Internal wallet deposits for refunds and sale proceeds are sent through RabbitMQ.
- `wallet-service` consumes the queue and updates the wallet balance directly.

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Prisma: `npx prisma generate` (after `npm install`)

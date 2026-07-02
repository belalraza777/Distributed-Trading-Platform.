# api-gateway

TypeScript + Express gateway for the trading microservices. It exposes a single HTTP entry point and forwards requests to the matching service.

## Scripts

- `npm run dev` - start the gateway in watch mode
- `npm run build` - compile TypeScript into `dist/`
- `npm run start` - run the compiled gateway from `dist/app.js`

## Gateway Routes

| Gateway route(s) | Forwards to | Notes |
| --- | --- | --- |
| `GET /` | api-gateway | Simple status response from the gateway itself |
| `GET /api/health` | api-gateway | Gateway health check |
| `ALL /api/auth/*` | auth-service | Proxies the auth routes mounted at the service root |
| `ALL /api/market-data/*` | market-data-service | Proxies the stock routes mounted at the service root |
| `ALL /api/notifications/*` | notification-service | Proxies to the notification service root |
| `ALL /api/orders/*` | order-service | Proxies to the order service root |
| `ALL /api/portfolio/*` | portfolio-service | Rewritten by the gateway to preserve the service's `/portfolio` mount |
| `ALL /api/wallet/*` | wallet-service | Proxies the wallet routes mounted at the service root |

## Service Endpoints

### auth-service

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `GET /api/auth/health`

### market-data-service

- `GET /api/market-data/search`
- `GET /api/market-data`
- `POST /api/market-data`
- `POST /api/market-data/:symbol/price`
- `GET /api/market-data/:symbol`
- `GET /api/market-data/:symbol/price`
- `GET /api/market-data/:symbol/history`
- `PUT /api/market-data/:id`
- `DELETE /api/market-data/:id`

### portfolio-service

- `GET /api/portfolio/`
- `GET /api/portfolio/:symbol`

### wallet-service

- `GET /api/wallet/balance`
- `POST /api/wallet/deposit`
- `POST /api/wallet/withdraw`
- `GET /api/wallet/transactions`

### order-service

The order routes are mounted at the service root, so the gateway forwards these endpoints directly.

- `GET /api/orders/`
- `GET /api/orders/:id`
- `POST /api/orders/`
- `POST /api/orders/:id/cancel`

### notification-service

The service currently does not mount HTTP routes in its `app.ts`, so the gateway proxy is in place but there are no active REST endpoints to document yet.

## Environment Variables

If your services are not running on the default ports, override these values:

```env
AUTH_SERVICE_URL=http://localhost:3001
MARKET_DATA_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
PORTFOLIO_SERVICE_URL=http://localhost:3005
WALLET_SERVICE_URL=http://localhost:3006
```

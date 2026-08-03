# Admin Service

The admin service provides platform administration APIs. It owns only the `banned_users` table and retrieves user, order, and wallet information through protected internal service APIs.

## Run

```bash
npm run dev
```

The default port is `3007`. Apply migrations before starting:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Environment variables

```env
PORT=3007
DATABASE_URL=postgresql://postgres:password@localhost:5432/trading_admin_service?schema=public
JWT_SECRET=shared-jwt-secret
INTERNAL_SERVICE_SECRET=shared-internal-secret
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3004
WALLET_SERVICE_URL=http://localhost:3006
RABBIT_URL=amqp://localhost
```

## API

All routes require a Bearer JWT for a user with the `ADMIN` role. They are available directly at `/` or through the gateway at `http://localhost:3000/api/admin`.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard` | Combined user, order, and wallet totals |
| GET | `/users` | List users from auth-service |
| GET | `/users/:id` | Get one user from auth-service |
| POST | `/users/:id/ban` | Ban a user |
| POST | `/users/:id/unban` | Unban a user |
| GET | `/orders` | List orders from order-service |
| GET | `/orders/:id` | Get one order from order-service |
| POST | `/orders/:id/cancel` | Force-cancel an order |

Ban requests require:

```json
{ "reason": "Repeated policy violations" }
```

## Database

`banned_users` stores `id`, `userId`, `reason`, `bannedBy`, and `bannedAt`. One active ban is stored per user.

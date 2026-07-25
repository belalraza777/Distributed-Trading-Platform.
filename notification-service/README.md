# Notification Service

The **Notification Service** is responsible for managing and delivering user notifications in the Trading Microservices platform.

It consumes events from RabbitMQ, stores notifications in PostgreSQL, and delivers them through supported communication channels (Email and SMS). The service also exposes APIs for users to retrieve and manage their notifications.

---

## Features

- Event-driven architecture using RabbitMQ
- Stores notifications in PostgreSQL
- Email notification support
- SMS notification support
- Retry mechanism for failed notifications
- Notification status tracking
- Mark notifications as read
- Mark all notifications as read
- Pagination support
- JWT-protected APIs
- Health check endpoint
- Joi validation for RabbitMQ events

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- RabbitMQ
- Joi
- Axios

---

## Project Structure

```
notification-service/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── rabbit.ts
│   │
│   ├── messaging/
│   │   ├── consumer.ts
│   │   └── init.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── async.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── routes/
│   │   └── notification.route.ts
│   │
│   ├── services/
│   │   ├── notification.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   └── user.client.ts
│   │
│   ├── validators/
│   │   └── notification.validator.ts
│   │
│   ├── app.ts
│   │
│   └── ...
│
├── package.json
└── README.md
```

---

# Architecture

```
                  RabbitMQ
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
order.executed   payment.notification  notification.retry
      │               │                │
      └───────────────┼────────────────┘
                      ▼
            Notification Service
                      │
          Save Notification (PostgreSQL)
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
      Email Service           SMS Service
```

---

# Notification Flow

```
RabbitMQ Event
      │
      ▼
Validate using Joi
      │
      ▼
Fetch User Details
      │
      ▼
Create Notification (PENDING)
      │
      ▼
Send Email & SMS (Promise.allSettled)
      │
      ▼
Update Status
   ┌──────────────┐
   │              │
   ▼              ▼
 SENT         FAILED
                  │
                  ▼
          Retry Queue (Max Retries)
```

---

# Notification Status

| Status | Description |
|---------|-------------|
| PENDING | Notification has been created and is waiting for delivery. |
| SENT | Notification delivered successfully. |
| FAILED | Notification delivery failed. |

---

# Database Schema

## Notification

| Field | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | User ID |
| title | String | Notification title |
| message | String | Notification body |
| is_read | Boolean | Read status |
| status | Enum | Delivery status |
| sent_at | DateTime | Delivery timestamp |
| error | String | Delivery error |
| retry_count | Integer | Retry attempts |
| created_at | DateTime | Creation timestamp |

---

# RabbitMQ Queues

## Consumed Queues

| Queue | Purpose |
|---------|---------|
| order.executed.notification | Notify users after successful trade execution |
| payment.notification | Notify users about payment updates |
| notification.retry | Retry failed notifications |

---

# API Endpoints

## Health

```
GET /health
```

Returns service health.

---

## Get Notifications

```
GET /?page=1&limit=20
```

Returns paginated notifications for the authenticated user.

Authentication required.

---

## Mark Notification as Read

```
PATCH /:id/read
```

Marks a notification as read.

Authentication required.

---

## Mark All Notifications as Read

```
PATCH /read-all
```

Marks every unread notification as read.

Authentication required.

---

# Retry Mechanism

If notification delivery fails:

1. Status becomes **FAILED**
2. Retry count is increased
3. Notification is published to **notification.retry**
4. Notification is retried until the configured maximum retry count is reached

This helps recover from temporary Email/SMS provider failures.

---

# Validation

All RabbitMQ messages are validated using **Joi** before processing.

Invalid events are rejected and logged without crashing the consumer.

---

# Authentication

All public APIs require JWT authentication.

The authenticated user can only access and modify their own notifications.

---

# Environment Variables

```env
PORT=3005

DATABASE_URL=

JWT_SECRET=

RABBITMQ_URL=

USER_SERVICE_URL=

INTERNAL_SERVICE_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=
```

---

# Running Locally

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

Start the development server

```bash
npm run dev
```

Build the project

```bash
npm run build
```

Run production build

```bash
npm start
```

---

# Design Principles

- Event-driven communication
- Loose coupling through RabbitMQ
- Clean service-layer architecture
- SOLID principles
- Centralized error handling
- Input validation using Joi
- Concurrent notification delivery
- Persistent notification history
- Automatic retry for failed deliveries
- Scalable and production-ready design

---

# Future Enhancements

- Push notifications
- In-app real-time notifications (WebSocket)
- Notification preferences
- Email templates
- SMS provider integration
- Scheduled notifications
- Dead Letter Queue (DLQ)
- Notification analytics
- Rate limiting
- Notification search and filtering

---

## License

This project is part of the **Trading Microservices Platform** and is intended for educational and learning purposes.
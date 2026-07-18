# 💳 Wallet Service

The **Wallet Service** manages user wallet balances, deposits, withdrawals, and transaction history.

It supports two payment modes:

- **INTERNAL** – Demo money for development/testing.
- **RAZORPAY** – Real money deposits using Razorpay.

The payment provider can be switched using a single environment variable.

---

# Features

- User Wallet Management
- Deposit Money
- Withdraw Money
- Wallet Balance
- Transaction History
- RabbitMQ Internal Deposits
- Razorpay Order Creation
- Razorpay Payment Verification
- Razorpay Webhook Integration
- Payment Notifications
- Provider Switching (INTERNAL / RAZORPAY)

---

# Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- RabbitMQ
- Razorpay

---

# Project Structure

```
src
├── config
├── controllers
├── messaging
├── middleware
├── routes
├── services
├── types
├── utils
└── app.ts
```

---

# Payment Providers

## INTERNAL

Used for development and testing.

- No real payment
- Balance updates immediately
- Transaction status = COMPLETED

---

## RAZORPAY

Used for real money.

- Creates Razorpay Order
- Saves transaction as PENDING
- Verifies payment signature
- Waits for Razorpay Webhook
- Credits wallet after confirmation

---

# Internal Deposit Flow (RabbitMQ)

Internal wallet deposits are processed through RabbitMQ.

```
order-service
      │
Publish Event
(wallet.deposit.requested)
      │
      ▼
RabbitMQ
      │
      ▼
wallet-service Consumer
      │
      ▼
internalDeposit()
      │
      ▼
Wallet Balance Updated
Transaction Created
(COMPLETED)
```

The public `/deposit` endpoint remains available for real customer payments.

---

# Phase 1 — INTERNAL Deposit

```
User
   │
POST /wallet/deposit
   │
   ▼
Validate Amount
   │
   ▼
paymentService.processDeposit()
   │
   ▼
Internal Provider
   │
   ▼
Wallet += Amount
   │
   ▼
Create Transaction
status = COMPLETED
provider = INTERNAL
   │
   ▼
Return Updated Balance
```

---

# Phase 2 — Razorpay Deposit

```
User
   │
POST /wallet/deposit
   │
   ▼
Create Razorpay Order
   │
   ▼
Create WalletTransaction
status = PENDING
provider = RAZORPAY
   │
   ▼
Return order_id
   │
   ▼
Frontend opens Razorpay Checkout
   │
User Pays
   │
   ▼
POST /wallet/verify-payment
   │
Verify Payment Signature
   │
Save payment_id
(No Wallet Update)
   │
   ▼
Razorpay Webhook
(payment.captured)
   │
Verify Webhook Signature
   │
Check Transaction Status
   │
Already COMPLETED?
      │
 YES ─────────► Ignore
      │
 NO
      │
      ▼
Wallet += Amount
      │
Transaction
PENDING → COMPLETED
      │
Publish Notification
      │
      ▼
Success
```

---

# Why Verify Payment + Webhook?

Both are used because they have different responsibilities.

## Verify Payment API

- Verifies Razorpay payment signature.
- Stores Razorpay Payment ID.
- Returns success to frontend.
- Does **NOT** update wallet balance.

---

## Razorpay Webhook

- Sent directly by Razorpay.
- Verifies webhook signature.
- Credits wallet.
- Marks transaction as COMPLETED.
- Prevents duplicate deposits.

The webhook is the **source of truth** for wallet updates.

---

# Transaction Status Flow

```
Create Order
      │
      ▼
PENDING
      │
      ▼
Verify Payment
      │
      ▼
Webhook
(payment.captured)
      │
      ▼
COMPLETED
```

If payment fails:

```
PENDING
    │
    ▼
FAILED
```

---

# Deposit Flow (Code Level)

```
wallet.routes.ts
        │
POST /deposit
        │
        ▼
wallet.controller.ts
deposit()
        │
        ▼
wallet.service.ts
deposit()
        │
        ├── findOrCreateWallet()
        ├── paymentService.createDepositOrder()
        ├── Razorpay Order
        ├── Create Transaction (PENDING)
        │
        ▼
Return Order Details
```

---

# Verify Payment Flow

```
wallet.routes.ts
POST /verify-payment
        │
        ▼
wallet.controller.ts
verifyPayment()
        │
        ▼
wallet.service.ts
verifyPayment()
        │
        ├── Verify Signature
        ├── Save provider_payment_id
        │
        ▼
Return Success
```

---

# Webhook Flow

```
Razorpay
      │
payment.captured
      │
      ▼
wallet.routes.ts
POST /webhook
      │
      ▼
wallet.controller.ts
razorpayWebhook()
      │
      ▼
payment.service.ts
verifyWebhook()
      │
      ▼
wallet.service.ts
handleWebhook()
      │
      ├── Find Transaction
      ├── Already COMPLETED?
      │      │
      │      ├── YES → Ignore
      │      └── NO
      │
      ├── Update Wallet Balance
      ├── Update Transaction
      ├── Publish Notification
      │
      ▼
Return 200 OK
```

---

# Withdraw Flow

```
POST /withdraw
      │
      ▼
Find Wallet
      │
Check Balance
      │
paymentService.processWithdraw()
      │
Wallet -= Amount
      │
Create Transaction
(COMPLETED)
      │
Return Updated Balance
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/wallet/balance` | Get wallet balance |
| POST | `/wallet/deposit` | Create deposit |
| POST | `/wallet/verify-payment` | Verify Razorpay payment |
| POST | `/wallet/webhook` | Razorpay webhook |
| POST | `/wallet/withdraw` | Withdraw money |
| GET | `/wallet/transactions` | Transaction history |

---

# Transaction Status

| Status | Meaning |
|----------|---------|
| PENDING | Waiting for payment confirmation |
| COMPLETED | Payment successful |
| FAILED | Payment failed |

---

# Payment Providers

| Feature | INTERNAL | RAZORPAY |
|----------|----------|-----------|
| Real Money | ❌ | ✅ |
| RabbitMQ Deposit | ✅ | ❌ |
| Balance Updated Immediately | ✅ | ❌ |
| Order Creation | ❌ | ✅ |
| Verify Payment API | ❌ | ✅ |
| Webhook | ❌ | ✅ |
| Transaction Flow | COMPLETED | PENDING → COMPLETED |

---

# Environment Variables

```env
DATABASE_URL=

PAYMENT_PROVIDER=INTERNAL

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Switch to Razorpay by changing:

```env
PAYMENT_PROVIDER=RAZORPAY
```

No changes are required in the routes, controllers, or wallet service.

---

# Database Models

- Wallet
- WalletTransaction

Supported Providers:

- INTERNAL
- RAZORPAY

Transaction Types:

- DEPOSIT
- WITHDRAW

Transaction Status:

- PENDING
- COMPLETED
- FAILED

---

# Architecture

```
                Wallet Service

        ┌─────────────────────┐
        │     Controller      │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │    Wallet Service    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Payment Service    │
        └───────┬───────┬─────┘
                │       │
         INTERNAL   RAZORPAY
                │       │
                └───────┘
```

The payment provider is selected automatically using the `PAYMENT_PROVIDER` environment variable, allowing the rest of the application to remain provider-independent.


# 💳 Wallet Service

The **Wallet Service** manages user wallet balances, deposits, withdrawals, and transaction history.

It supports two payment modes:

* **INTERNAL** – Demo/internal money for development, testing, and trusted service-to-service operations.
* **RAZORPAY** – Real money deposits using Razorpay.

The payment provider can be switched using a single environment variable.

---

# Features

* User Wallet Management
* Wallet Balance
* Deposit Money
* Withdraw Money
* Internal Withdrawal for Order Fund Locking
* Transaction History
* RabbitMQ Internal Deposits
* Razorpay Order Creation
* Razorpay Payment Verification
* Razorpay Webhook Integration
* Payment Notifications
* Provider Switching (`INTERNAL` / `RAZORPAY`)
* Database Transactions for Wallet Updates

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* RabbitMQ
* Razorpay

---

# Project Structure

```text
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

Used for development, testing, and trusted internal service operations.

* No real payment provider
* Balance updates immediately
* Transaction status = `COMPLETED`
* Used by internal wallet operations
* Used for trusted service-to-service fund deductions

---

## RAZORPAY

Used for real money.

* Creates Razorpay Order
* Saves transaction as `PENDING`
* Verifies payment signature
* Waits for Razorpay Webhook
* Credits wallet after confirmation

---

# Internal Deposit Flow (RabbitMQ)

Internal wallet deposits are processed through RabbitMQ.

```text
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

The public `/deposit` endpoint remains available for customer payments.

Internal deposits are also used to release funds when a BUY order is cancelled or fails.

---

# Internal Withdrawal Flow

The Wallet Service exposes a protected internal withdrawal endpoint for trusted services such as `order-service`.

This operation is **not a Razorpay withdrawal**.

It directly deducts money from the wallet using the `INTERNAL` provider and records a completed transaction.

```text
order-service
      │
      │ POST /internal/withdraw
      │ x-user-id
      │ x-internal-secret
      ▼
wallet-service
      │
      ▼
Internal Secret Validation
      │
      ▼
internalWithdraw()
      │
      ├── Validate Amount
      ├── Find Wallet
      ├── Check Balance
      ├── Deduct Balance
      └── Create INTERNAL Transaction
              │
              ▼
        COMPLETED
```

This is currently used by the BUY order flow to deduct/lock the required order funds before the order executes.

---

# Internal Withdrawal Security

The internal withdrawal endpoint is protected using a shared service secret.

The requesting service must provide:

```http
x-internal-secret: <INTERNAL_SECRET>
```

The secret must match the Wallet Service environment variable:

```env
INTERNAL_SECRET=
```

If the secret is missing or incorrect:

```text
403 Forbidden
```

This endpoint is intended for trusted service-to-service communication and should not be exposed directly to untrusted clients.

---

# Phase 1 — INTERNAL Deposit

```text
User / Internal Service
          │
POST /wallet/deposit
          │
          ▼
Validate Amount
          │
          ▼
paymentService.createDepositOrder()
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

```text
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

* Verifies Razorpay payment signature.
* Stores Razorpay Payment ID.
* Returns success to frontend.
* Does **not** update wallet balance.

---

## Razorpay Webhook

* Sent directly by Razorpay.
* Verifies webhook signature.
* Credits wallet.
* Marks transaction as `COMPLETED`.
* Prevents duplicate deposits.

The webhook is the **source of truth** for wallet balance updates.

---

# Transaction Status Flow

For Razorpay deposits:

```text
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

```text
PENDING
    │
    ▼
FAILED
```

For internal operations, the transaction is created directly as:

```text
COMPLETED
```

---

# Database Transactions

Wallet balance changes and their corresponding transaction records are executed using Prisma database transactions where multiple database operations must succeed together.

Example:

```text
BEGIN TRANSACTION
      │
      ├── Update Wallet Balance
      │
      ├── Create WalletTransaction
      │
      ▼
COMMIT
```

If any operation fails:

```text
ROLLBACK
```

This prevents inconsistent states such as:

```text
Wallet balance updated
        +
Transaction record missing
```

The same transaction approach is used for:

* Internal deposits
* Internal withdrawals
* Normal withdrawals
* Completed Razorpay webhook processing

---

# Deposit Flow (Code Level)

```text
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

```text
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

```text
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
      ├── DB Transaction
      │     ├── Update Wallet Balance
      │     └── Update Transaction
      │
      ├── Publish Notification
      │
      ▼
Return 200 OK
```

---

# Withdraw Flow

Normal user withdrawal uses the configured payment provider.

```text
POST /withdraw
      │
      ▼
Find Wallet
      │
Check Balance
      │
paymentService.processWithdraw()
      │
      ▼
RAZORPAY / INTERNAL
      │
      ▼
DB Transaction
      │
      ├── Wallet -= Amount
      └── Create Transaction
              │
              ▼
          COMPLETED
      │
      ▼
Publish Notification
      │
      ▼
Return Updated Balance
```

When `PAYMENT_PROVIDER=RAZORPAY`, the withdrawal operation currently depends on the Razorpay withdrawal implementation.

---

# Internal Withdrawal Flow

Internal withdrawal is separate from customer withdrawal.

```text
POST /internal/withdraw
      │
      ▼
Validate x-internal-secret
      │
      ▼
internalWithdraw()
      │
      ├── Find Wallet
      ├── Check Balance
      │
      ▼
DB Transaction
      │
      ├── Wallet -= Amount
      └── Create Transaction
              │
              ├── provider = INTERNAL
              ├── type = WITHDRAW
              └── status = COMPLETED
      │
      ▼
Return Updated Balance
```

The current purpose of this endpoint is to deduct funds for BUY orders.

---

# API Endpoints

| Method | Endpoint                 | Description                                        |
| ------ | ------------------------ | -------------------------------------------------- |
| GET    | `/wallet/balance`        | Get wallet balance                                 |
| POST   | `/wallet/deposit`        | Create deposit                                     |
| POST   | `/wallet/verify-payment` | Verify Razorpay payment                            |
| POST   | `/wallet/webhook`        | Razorpay webhook                                   |
| POST   | `/wallet/withdraw`       | Withdraw money                                     |
| GET    | `/wallet/transactions`   | Transaction history                                |
| POST   | `/internal/withdraw`     | Trusted internal withdrawal for order fund locking |
| GET    | `/internal/stats`        | Internal wallet statistics                         |

---

# Internal API Authentication

Internal endpoints require:

```http
x-internal-secret: <INTERNAL_SECRET>
```

Example:

```http
POST /internal/withdraw
x-user-id: 123
x-internal-secret: your-secret
Content-Type: application/json
```

Request body:

```json
{
  "amount": 1000
}
```

Invalid or missing internal secret:

```http
403 Forbidden
```

---

# Transaction Types

| Type       | Purpose                    |
| ---------- | -------------------------- |
| `DEPOSIT`  | Money added to wallet      |
| `WITHDRAW` | Money deducted from wallet |

Internal BUY fund locking currently uses:

```text
type = WITHDRAW
provider = INTERNAL
status = COMPLETED
```

The corresponding fund release is handled through the internal deposit flow.

---

# Transaction Status

| Status      | Meaning                          |
| ----------- | -------------------------------- |
| `PENDING`   | Waiting for payment confirmation |
| `COMPLETED` | Operation successfully completed |
| `FAILED`    | Operation failed                 |

---

# Payment Providers

| Feature                     | INTERNAL    | RAZORPAY              |
| --------------------------- | ----------- | --------------------- |
| Real Money                  | ❌           | ✅                     |
| Internal Operations         | ✅           | ❌                     |
| RabbitMQ Deposit            | ✅           | ❌                     |
| Balance Updated Immediately | ✅           | ❌                     |
| Order Creation              | ❌           | ✅                     |
| Verify Payment API          | ❌           | ✅                     |
| Webhook                     | ❌           | ✅                     |
| Transaction Flow            | `COMPLETED` | `PENDING → COMPLETED` |

---

# Environment Variables

```env
DATABASE_URL=

PAYMENT_PROVIDER=INTERNAL

# Internal service authentication
INTERNAL_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Switch to Razorpay by changing:

```env
PAYMENT_PROVIDER=RAZORPAY
```

No changes are required in the normal customer deposit routes.

`INTERNAL_SECRET` is required for protected internal service endpoints.

---

# Internal Admin Endpoint

```text
GET /internal/stats
```

Returns completed deposit and withdrawal totals for `admin-service`.

It requires:

```http
x-internal-secret: <INTERNAL_SECRET>
```

Invalid or missing secret:

```text
403 Forbidden
```

---

# Internal Withdrawal Endpoint

```text
POST /internal/withdraw
```

Used by trusted services such as `order-service` to deduct funds for BUY order processing.

Required headers:

```http
x-user-id: <USER_ID>
x-internal-secret: <INTERNAL_SECRET>
```

Request:

```json
{
  "amount": 1000
}
```

The operation:

1. Validates the amount.
2. Finds the user's wallet.
3. Checks available balance.
4. Decrements the wallet balance.
5. Creates an `INTERNAL` withdrawal transaction.
6. Returns the updated balance.

Wallet update and transaction creation are performed inside a database transaction.

---

# Database Models

* Wallet
* WalletTransaction

Supported Providers:

* `INTERNAL`
* `RAZORPAY`

Transaction Types:

* `DEPOSIT`
* `WITHDRAW`

Transaction Status:

* `PENDING`
* `COMPLETED`
* `FAILED`

---

# Architecture

```text
                    Wallet Service

          ┌──────────────────────────┐
          │       Controllers        │
          └────────────┬─────────────┘
                       │
              ┌────────▼────────┐
              │  Wallet Service │
              └────────┬────────┘
                       │
          ┌────────────▼────────────┐
          │     Payment Service     │
          └────────────┬────────────┘
                       │
                ┌──────┴──────┐
                │             │
            INTERNAL       RAZORPAY
                │             │
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │   Prisma    │
                │ PostgreSQL  │
                └─────────────┘
```

Internal service operations use protected internal endpoints:

```text
order-service
      │
      │ x-internal-secret
      ▼
wallet-service
      │
      ▼
internalWithdraw()
      │
      ▼
Prisma Transaction
```

The payment provider is selected automatically using the `PAYMENT_PROVIDER` environment variable, while trusted internal operations explicitly use the `INTERNAL` provider.

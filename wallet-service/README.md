# 💳 Payment Flow — Wallet Service

## Internal Queue Flow

Internal wallet deposits are now handled through RabbitMQ, not by calling the deposit HTTP endpoint from other services.

- `order-service` publishes internal deposit messages to `wallet.deposit.requested`
- `wallet-service` consumes the queue on startup
- `wallet-service` applies the balance update directly with `internalDeposit()`
- The public `/deposit` endpoint is still available for external/manual use

## Phase 1 (MVP) — Demo Money (No Real Payment)

> User deposits fake money to test the app. No real gateway involved.

```
User clicks "Deposit ₹1000"
        ↓
API receives the request
        ↓
Check: is amount valid? (> 0)
        ↓
Add ₹1000 to wallet balance
        ↓
Save transaction record
  → type: DEPOSIT
  → provider: INTERNAL
  → status: SUCCESS
        ↓
Return new balance to user ✅
```

**Same flow for Withdraw** — just subtracts instead of adding.
Also checks: does user have enough balance? If not → reject.

---

## Phase 2 — Real Money via Razorpay

> User pays real money. Balance only updates after payment is confirmed.

```
User clicks "Deposit ₹1000"
        ↓
App creates a Razorpay order
  → gets back an order_id
        ↓
Save transaction as PENDING
  (balance NOT updated yet)
        ↓
User sees Razorpay checkout popup
        ↓
User enters card/UPI details and pays
        ↓
Razorpay confirms payment via Webhook
        ↓
App verifies the webhook signature
  (to make sure it's legit)
        ↓
Add ₹1000 to wallet balance
Update transaction → SUCCESS ✅
```

---

## Key Difference

| | Phase 1 (INTERNAL) | Phase 2 (RAZORPAY) |
|---|---|---|
| Real money? | ❌ No | ✅ Yes |
| Balance updated | Immediately | Only after Razorpay confirms |
| Transaction status | SUCCESS right away | PENDING → then SUCCESS |
| Needs internet/gateway | ❌ No | ✅ Yes |

---

---

## Function Call Flow (Code Level)

### Phase 1 — Deposit (INTERNAL)

```
wallet.routes.ts
  router.post("/deposit") 
        ↓
wallet.controller.ts
  deposit(req, res)
        ↓
wallet.service.ts
  deposit(userId, amount, description)
        │
        ├── findOrCreateWallet(userId)
        │
        ├── paymentService.processDeposit(amount)
        │         ↓
        │   payment.service.ts
        │     processDeposit(amount)
        │           ↓
        │     internal.deposit(amount)
        │           ↓
        │     returns { provider: "INTERNAL", reference_id }
        │
        ├── prisma.wallet.update()        → balance += amount
        ├── prisma.transaction.create()   → status: SUCCESS
        │
        ▼
  returns { balance, transaction }
        ↓
wallet.controller.ts
  res.json({ success: true, data })
```

### Phase 2 — Deposit (RAZORPAY)

```
wallet.routes.ts
  router.post("/deposit")
        ↓
wallet.controller.ts
  deposit(req, res)
        ↓
wallet.service.ts
  deposit(userId, amount, description)
        │
        ├── findOrCreateWallet(userId)
        │
        ├── paymentService.processDeposit(amount)
        │         ↓
        │   payment.service.ts
        │     processDeposit(amount)
        │           ↓
        │     razorpay.deposit(amount)
        │           ↓
        │     razorpay.orders.create()
        │           ↓
        │     returns { provider: "RAZORPAY", provider_order_id }
        │
        ├── prisma.transaction.create()   → status: PENDING
        │   (balance NOT updated here)
        │
        ▼
  returns { provider_order_id }
        ↓
Frontend opens Razorpay checkout using provider_order_id
        ↓
User pays
        ↓
Razorpay calls → wallet.routes.ts
  router.post("/webhook")
        ↓
wallet.controller.ts
  handleWebhook(req, res)
        ↓
wallet.service.ts
  confirmDeposit(provider_order_id, provider_payment_id)
        │
        ├── verify signature
        ├── prisma.wallet.update()        → balance += amount
        ├── prisma.transaction.update()   → PENDING to SUCCESS
        │
        ▼
  returns { success: true }
```

### Withdraw — Same Pattern

```
wallet.controller.ts → withdraw()
        ↓
wallet.service.ts → withdraw(userId, amount)
        │
        ├── findOrCreateWallet(userId)
        ├── check balance >= amount
        ├── paymentService.processWithdraw(amount)
        ├── prisma.wallet.update()        → balance -= amount
        ├── prisma.transaction.create()   → status: SUCCESS
        │
        ▼
  returns { balance, transaction }
```

---

## How to Switch to Razorpay

Just change **one line** in your `.env` file:

```env
# Phase 1 (current)
PAYMENT_PROVIDER=INTERNAL

# Phase 2 (when ready)
PAYMENT_PROVIDER=RAZORPAY
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

No changes needed in routes, controller, or wallet service.
Only `payment.service.ts` activates the Razorpay logic.
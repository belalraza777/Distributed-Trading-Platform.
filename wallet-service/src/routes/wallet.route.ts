import express, { Router } from "express";
import {
  getBalance,
  deposit,
  withdraw,
  getTransactions,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/wallet.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/async.middleware";
import { AuthRequest } from "../types/auth.types";

const router = Router();

// Wallet APIs
// GET /api/v1/wallet/balance
router.get(
  "/balance",
  requireAuth,
  asyncHandler<AuthRequest>(getBalance)
);

// POST /api/v1/wallet/deposit
router.post(
  "/deposit",
  requireAuth,
  asyncHandler<AuthRequest>(deposit)
);

// POST /api/v1/wallet/withdraw
router.post(
  "/verify-payment",
  requireAuth,
  asyncHandler<AuthRequest>(verifyPayment)
);

// POST /api/v1/wallet/withdraw
router.post(
  "/withdraw",
  requireAuth,
  asyncHandler<AuthRequest>(withdraw)
);

// GET /api/v1/wallet/transactions
router.get(
  "/transactions",
  requireAuth,
  asyncHandler<AuthRequest>(getTransactions)
);

// Razorpay Webhook /api/v1/wallet/webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(razorpayWebhook)
);

export default router;
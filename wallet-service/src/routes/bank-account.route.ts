import { Router } from "express";
import {
  createBankAccount,
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../controllers/bank-account.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/async.middleware";
import { AuthRequest } from "../types/auth.types";
import { validate } from "../middleware/validate";

import { bankAccountSchema } from "../validators/bank-account.validator";

const router = Router();

// ───────────────── BANK ACCOUNT APIs ─────────────────

// POST Create Bank Account
router.post(
  "/bank-account",
  requireAuth,
  validate(bankAccountSchema),
  asyncHandler<AuthRequest>(createBankAccount)
);

// GET Bank Account
router.get(
  "/bank-account",
  requireAuth,
  asyncHandler<AuthRequest>(getBankAccount)
);

// PUT Update Bank Account
router.put(
  "/bank-account",
  requireAuth,
  validate(bankAccountSchema),
  asyncHandler<AuthRequest>(updateBankAccount)
);

// DELETE Bank Account
router.delete(
  "/bank-account",
  requireAuth,
  asyncHandler<AuthRequest>(deleteBankAccount)
);

export default router;
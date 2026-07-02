import { Router } from "express";
import { getBalance, deposit, withdraw, getTransactions } from "../controllers/wallet.controller";
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();

// All routes require auth middleware (attach req.user before reaching here)
// GET /balance - Get the current balance of the authenticated user
// POST /deposit - Deposit an amount to the authenticated user's wallet
// POST /withdraw - Withdraw an amount from the authenticated user's wallet
// GET /transactions - Get the transaction history of the authenticated user
router.get("/balance", requireAuth, asyncHandler<AuthRequest>(getBalance));
router.post("/deposit", requireAuth, asyncHandler<AuthRequest>(deposit));
router.post("/withdraw", requireAuth, asyncHandler<AuthRequest>(withdraw));
router.get("/transactions", requireAuth, asyncHandler<AuthRequest>(getTransactions));

export default router;
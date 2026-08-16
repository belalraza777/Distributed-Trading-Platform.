import { Router } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../middleware/async.middleware';
import { requireAuth } from "../middleware/auth.middleware";
import { AuthRequest } from "../types/auth.types";
import * as walletService from "../services/wallet.service";


const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'internal-secret';
const router = Router();

router.use((req, res, next) => {
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
});

// Internal routes for wallet management
// Get wallet statistics [Admin only]
router.get('/internal/stats', asyncHandler(async (req, res) => {
  const [deposits, withdrawals] = await Promise.all([
    prisma.walletTransaction.aggregate({
      where: { type: 'DEPOSIT', status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: { type: 'WITHDRAW', status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalDeposits: Number(deposits._sum.amount || 0),
      totalWithdrawals: Number(withdrawals._sum.amount || 0),
    },
  });
}));

//Internal route for Internal Withdrawal Request for Buying Stocks
//This is for Lock the Fund at the time of placing the order
router.post('/internal/withdraw', asyncHandler<AuthRequest>(async (req, res) => {
  const { amount, userId } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  // Call the internalWithdraw function from walletService
  await walletService.internalWithdraw(userId, Number(amount));

  res.status(200).json({ success: true, message: 'Withdrawal request processed successfully' });
}));


export default router;

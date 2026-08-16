import { Router } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../middleware/async.middleware';

const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal-secret';
const router = Router();

router.use((req, res, next) => {
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
});

// Internal routes for wallet management[ADMIN ONLY]
// Get wallet statistics
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

export default router;

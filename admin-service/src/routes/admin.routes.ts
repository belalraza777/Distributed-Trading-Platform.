import { Router } from 'express';
import { asyncHandler } from '../middleware/async.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  banUser,
  cancelOrder,
  getDashboard,
  getOrder,
  getOrders,
  getUser,
  getUsers,
  unbanUser,
} from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', asyncHandler(getDashboard));
router.get('/users', asyncHandler(getUsers));
router.get('/users/:id', asyncHandler(getUser));
router.post('/users/:id/ban', asyncHandler(banUser));
router.post('/users/:id/unban', asyncHandler(unbanUser));
router.get('/orders', asyncHandler(getOrders));
router.get('/orders/:id', asyncHandler(getOrder));
router.post('/orders/:id/cancel', asyncHandler(cancelOrder));

export default router;
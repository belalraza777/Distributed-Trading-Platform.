import { Router } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../middleware/async.middleware';

const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'internal-secret';
const router = Router();

router.use((req, res, next) => {
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
});

const getOrderId = (value: string) => {
  const orderId = Number(value);

  if (!Number.isInteger(orderId)) {
    throw Object.assign(new Error('Order ID is required'), { statusCode: 400 });
  }

  return orderId;
};

// Internal routes for order management[ADMIN ONLY]

// Get all orders
router.get('/internal/orders', asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { created_at: 'desc' } });
  res.json({ success: true, data: orders });
}));

// Get a specific order by ID
router.get('/internal/orders/:id', asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: getOrderId(req.params.id) } });

  if (!order) {
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  }
  if (order.status === "EXECUTED") {
    throw Object.assign(new Error("Cannot cancel an executed order"), { statusCode: 400 })
  }

  res.json({ success: true, data: order });
}));

// Cancel an order by ID Forcefully
router.post('/internal/orders/:id/cancel', asyncHandler(async (req, res) => {
  const orderId = getOrderId(req.params.id);
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  }

  const cancelledOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  });

  res.json({ success: true, message: 'Order cancelled', data: cancelledOrder });
}));

// Get order statistics
router.get('/internal/stats', asyncHandler(async (req, res) => {
  const [totalOrders, volume] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);
  res.json({
    success: true,
    data: { totalOrders, totalVolume: Number(volume._sum.total || 0) },
  });
}));

export default router;

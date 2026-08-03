import { Router } from 'express';
import prisma from '../config/db';
import { internalAuth } from '../middleware/internalAuth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(internalAuth);

router.get('/internal/users', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
  res.json({ success: true, data: users });
}));

router.get('/internal/users/:id', asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    throw Object.assign(new Error('User ID is required'), { statusCode: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  res.json({ success: true, data: user });
}));

router.get('/internal/stats', asyncHandler(async (req, res) => {
  const totalUsers = await prisma.user.count();
  res.json({ success: true, data: { totalUsers } });
}));

export default router;

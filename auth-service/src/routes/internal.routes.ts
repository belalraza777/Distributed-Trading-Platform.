import { Router } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'internal-secret';

router.use((req, res, next) => {
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
});

// Internal routes for user management[ADMIN ONLY]

// Get all users
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

// Get a specific user by ID
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

// Get user statistics ,total users
router.get('/internal/stats', asyncHandler(async (req, res) => {
  const totalUsers = await prisma.user.count();
  res.json({ success: true, data: { totalUsers } });
}));

//Get User detail by ID for other services
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, name: true, email: true, phone: true, role: true, created_at: true },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ success: true, data: user });

}));


export default router;

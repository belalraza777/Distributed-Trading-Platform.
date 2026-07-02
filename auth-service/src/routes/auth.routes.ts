import { Router } from 'express';
import { login, logout, profile, register } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/async.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/profile', requireAuth, asyncHandler<AuthRequest>(profile));

export default router;

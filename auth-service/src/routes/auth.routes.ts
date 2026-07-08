import { Router } from 'express';
import { login, logout, profile, register, getUser } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/async.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';
import { internalAuth} from '../middleware/internalAuth.middleware';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/profile', requireAuth, asyncHandler<AuthRequest>(profile));

router.get('/:id', internalAuth, asyncHandler(getUser));


export default router;

import { Router } from 'express';
import { login, logout, profile, register, getUser } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/async.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';
import { internalAuth} from '../middleware/internalAuth.middleware';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, idParamSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/profile', requireAuth, asyncHandler<AuthRequest>(profile));

router.get('/:id', internalAuth, validate(idParamSchema, 'params'), asyncHandler(getUser));


export default router;

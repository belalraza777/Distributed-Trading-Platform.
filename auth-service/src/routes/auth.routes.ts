import { Router } from 'express';
import { login, logout, profile, register, refreshToken,updateProfileHandler,changePasswordHandler } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/async.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema, updateProfileSchema, changePasswordSchema,  } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', validate(refreshTokenSchema), asyncHandler(logout));
router.post('/refresh', asyncHandler(refreshToken));
router.get('/profile', requireAuth, asyncHandler<AuthRequest>(profile));
router.patch('/profile', requireAuth,validate(updateProfileSchema), asyncHandler<AuthRequest>(updateProfileHandler));
router.patch('/change-password', requireAuth, validate(changePasswordSchema), asyncHandler<AuthRequest>(changePasswordHandler));


export default router;

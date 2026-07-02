import { Router } from 'express';
import { getPortfolio, getHolding } from '../controllers/portfolio.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();

// all routes are protected — asyncHandler catches errors and sends to errorHandler

//to get the portfolio of the authenticated user
router.get('/', requireAuth, asyncHandler<AuthRequest>(getPortfolio));
//to get the holding of a specific symbol for the authenticated user
router.get('/:symbol', requireAuth, asyncHandler<AuthRequest>(getHolding));

export default router;
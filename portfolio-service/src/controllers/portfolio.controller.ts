import { Response } from 'express';
import * as portfolioService from '../services/portfolio.service';
import { AuthRequest } from '../types/auth.types';

// GET /api/v1/portfolio — returns all holdings with per-holding and total P&L
export const getPortfolio = async (req: AuthRequest, res: Response) => {
  const data = await portfolioService.getPortfolio(req.user.id);
  res.json({ success: true, data });
};

// GET /api/v1/portfolio/:symbol — returns single holding with P&L
export const getHolding = async (req: AuthRequest, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const data = await portfolioService.getHolding(req.user.id, symbol);
  res.json({ success: true, data });
};
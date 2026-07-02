import { Response } from "express";
import * as walletService from "../services/wallet.service";
import { AuthRequest } from "../types/auth.types";

// GET /api/v1/wallet/balance
export const getBalance = async (req: AuthRequest, res: Response) => {
  const data = await walletService.getBalance(req.user.id);
  res.json({ success: true, data });
};

// POST /api/v1/wallet/deposit
export const deposit = async (req: AuthRequest, res: Response) => {
  const { amount, description } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: "amount is required" });
  }

  const data = await walletService.deposit(req.user.id, Number(amount), description);
  res.json({ success: true, message: "Deposit successful", data });
};

// POST /api/v1/wallet/withdraw
export const withdraw = async (req: AuthRequest, res: Response) => {
  const { amount, description } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: "amount is required" });
  }

  const data = await walletService.withdraw(req.user.id, Number(amount), description);
  res.json({ success: true, message: "Withdrawal successful", data });
};

// GET /api/v1/wallet/transactions
export const getTransactions = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const data = await walletService.getTransactions(req.user.id, page, limit);
  res.json({ success: true, data });
};

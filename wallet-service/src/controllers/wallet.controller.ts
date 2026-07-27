import { Request, Response } from "express";
import * as walletService from "../services/wallet.service";
import { paymentService } from "../services/payment.service";
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
    return res.status(400).json({
      success: false,
      message: "amount is required",
    });
  }
  const data = await walletService.deposit(
    req.user.id,
    Number(amount),
    description
  );
  res.json({
    success: true,
    message: data.transaction.provider === "RAZORPAY" ? "Payment Order Created Successfully" : "Deposit successful",
    data,
  });
};

// POST /api/v1/wallet/verify-payment
export const verifyPayment = async (
  req: AuthRequest,
  res: Response
) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment data",
    });
  }

  const data = await walletService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  res.json({
    success: true, data,
  });
};

// POST /api/v1/wallet/webhook
export const razorpayWebhook = async (
  req: Request,
  res: Response
) => {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: "Missing webhook signature",
    });
  }
  const verified = paymentService.verifyWebhook(
    req.body,
    signature
  );

  if (!verified) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  await walletService.handleWebhook(JSON.parse(req.body.toString()));

  return res.status(200).json({
    success: true,
  });
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

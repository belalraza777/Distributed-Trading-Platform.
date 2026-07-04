import { Response } from "express";
import * as orderService from "../services/order.service";
import { AuthRequest } from "../types/auth.types";

// POST /api/v1/orders
export const placeOrder = async (req: AuthRequest, res: Response) => {
  const { symbol, type, quantity } = req.body;
  if (!symbol || !type || !quantity) {
    return res.status(400).json({ success: false, message: "symbol, type, quantity are required" });
  }

  const order = await orderService.placeOrder(req.user.id, symbol, type.toUpperCase(), Number(quantity), req.token);
  res.json({ success: true, message: "Order placed", data: order });
};

// POST /api/v1/orders/:id/cancel
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const orderId = Number(req.params.id);
  const order = await orderService.cancelOrder(req.user.id, orderId, req.token);
  res.json({ success: true, message: "Order cancelled", data: order });
};

// GET /api/v1/orders/:id
export const getOrder = async (req: AuthRequest, res: Response) => {
  const orderId = Number(req.params.id);
  const order = await orderService.getOrder(req.user.id, orderId);
  res.json({ success: true, data: order });
};

// GET /api/v1/orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const data = await orderService.getOrders(req.user.id, page, limit);
  res.json({ success: true, data });
};
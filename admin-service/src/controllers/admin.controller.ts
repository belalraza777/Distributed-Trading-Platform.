import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';

type AdminRequest = Request & { user: { id: number; role: 'USER' | 'ADMIN' } };

const parseId = (value: string, label: string) => {
  const parsed = Number(value);

  if (!value || Number.isNaN(parsed)) {
    throw Object.assign(new Error(`${label} is required`), { statusCode: 400 });
  }

  return parsed;
};

export const getDashboard = async (req: AdminRequest, res: Response) => {
  const data = await adminService.getDashboard();
  res.json({ success: true, data });
};

export const getUsers = async (req: AdminRequest, res: Response) => {
  const data = await adminService.getUsers();
  res.json({ success: true, data });
};

export const getUser = async (req: AdminRequest, res: Response) => {
  const userId = parseId(req.params.id, 'User ID');
  const data = await adminService.getUserById(userId);
  res.json({ success: true, data });
};

export const banUser = async (req: AdminRequest, res: Response) => {
  const userId = parseId(req.params.id, 'User ID');
  const { reason } = req.body as { reason?: string };

  if (!reason || !reason.trim()) {
    throw Object.assign(new Error('reason is required'), { statusCode: 400 });
  }

  const data = await adminService.banUser(userId, reason.trim(), req.user.id);
  res.status(201).json({ success: true, message: 'User banned', data });
};

export const unbanUser = async (req: AdminRequest, res: Response) => {
  const userId = parseId(req.params.id, 'User ID');
  const data = await adminService.unbanUser(userId);
  res.json({ success: true, message: 'User unbanned', data });
};

export const getOrders = async (req: AdminRequest, res: Response) => {
  const data = await adminService.getOrders();
  res.json({ success: true, data });
};

export const getOrder = async (req: AdminRequest, res: Response) => {
  const orderId = parseId(req.params.id, 'Order ID');
  const data = await adminService.getOrderById(orderId);
  res.json({ success: true, data });
};

export const cancelOrder = async (req: AdminRequest, res: Response) => {
  const orderId = parseId(req.params.id, 'Order ID');
  const data = await adminService.cancelOrder(orderId);
  res.json({ success: true, message: 'Order cancelled', data });
};
import axios from 'axios';
import prisma from '../config/db';

const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal-secret';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:3006';

const internalHeaders = {
  headers: {
    'x-internal-secret': INTERNAL_SECRET,
  },
};

const toHttpError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data
      ? String((error.response.data as { message?: string }).message || error.message)
      : error.message || 'Request failed';
    return Object.assign(new Error(message), {
      statusCode: error.response?.status ?? 500,
    });
  }

  if (error instanceof Error) {
    return Object.assign(error, { statusCode: 500 });
  }

  return Object.assign(new Error('Internal server error'), { statusCode: 500 });
};

const fetchInternalData = async <T>(url: string) => {
  try {
    const response = await axios.get(url, internalHeaders);
    return response.data.data as T;
  } catch (error) {
    throw toHttpError(error);
  }
};

const postInternalData = async <T>(url: string) => {
  try {
    const response = await axios.post(url, {}, internalHeaders);
    return response.data.data as T;
  } catch (error) {
    throw toHttpError(error);
  }
};

export const getDashboard = async () => {
  const [authStats, orderStats, walletStats] = await Promise.all([
    fetchInternalData<{ totalUsers: number }>(`${AUTH_SERVICE_URL}/internal/stats`),
    fetchInternalData<{ totalOrders: number; totalVolume: number }>(`${ORDER_SERVICE_URL}/internal/stats`),
    fetchInternalData<{ totalDeposits: number; totalWithdrawals: number }>(`${WALLET_SERVICE_URL}/internal/stats`),
  ]);

  return {
    totalUsers: authStats.totalUsers,
    totalOrders: orderStats.totalOrders,
    totalVolume: orderStats.totalVolume,
    totalDeposits: walletStats.totalDeposits,
    totalWithdrawals: walletStats.totalWithdrawals,
  };
};

export const getUsers = async () => fetchInternalData<any[]>(`${AUTH_SERVICE_URL}/internal/users`);

export const getUserById = async (userId: number) => fetchInternalData<any>(`${AUTH_SERVICE_URL}/internal/users/${userId}`);

export const banUser = async (userId: number, reason: string, bannedBy: number) => {
  const bannedUser = await prisma.bannedUser.upsert({
    where: { userId },
    update: {
      reason,
      bannedBy,
      bannedAt: new Date(),
    },
    create: {
      userId,
      reason,
      bannedBy,
      bannedAt: new Date(),
    },
  });

  return bannedUser;
};

export const unbanUser = async (userId: number) => {
  const bannedUser = await prisma.bannedUser.findUnique({ where: { userId } });

  if (!bannedUser) {
    throw Object.assign(new Error('User is not banned'), { statusCode: 404 });
  }

  await prisma.bannedUser.delete({ where: { userId } });
  return bannedUser;
};

export const getOrders = async () => fetchInternalData<any[]>(`${ORDER_SERVICE_URL}/internal/orders`);

export const getOrderById = async (orderId: number) => fetchInternalData<any>(`${ORDER_SERVICE_URL}/internal/orders/${orderId}`);

export const cancelOrder = async (orderId: number) => postInternalData<any>(`${ORDER_SERVICE_URL}/internal/orders/${orderId}/cancel`);
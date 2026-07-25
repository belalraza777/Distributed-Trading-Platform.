import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../middleware/async.middleware';

// @desc    Get all notifications for a user
// @route   GET /notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { user_id: userId } }),
  ]);

  res.status(200).json({
    success: true,
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Mark a notification as read
// @route   PATCH /notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const notificationId = parseInt(req.params.id);

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.user_id !== userId) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  });

  res.status(200).json({
    success: true,
    data: updatedNotification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const { count } = await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });

  res.status(200).json({
    success: true,
    data: {
      updatedCount: count,
    },
  });
});

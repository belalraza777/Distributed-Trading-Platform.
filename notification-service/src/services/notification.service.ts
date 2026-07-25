import { NotificationStatus } from "@prisma/client";
import prisma from "../config/db";
import { publishToQueue } from "../config/rabbit";
import { sendEmail } from "./email.service";
import { sendSMS } from "./sms.service";

const MAX_RETRIES = 3;

interface NotificationParams {
  userId: number;
  email?: string;
  phone?: string;
  title: string;
  message: string;
}

interface RetryNotificationParams extends NotificationParams {
  notificationId: number;
}

/**
 * Create a notification and initiate delivery.
 */
export async function notify({
  userId,
  email,
  phone,
  title,
  message,
}: NotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      user_id: userId,
      title,
      message,
      status: NotificationStatus.PENDING,
    },
  });

  await processNotification({
    notificationId: notification.id,
    retryCount: notification.retry_count,
    email,
    phone,
    title,
    message,
  });
}

/**
 * Retry a failed notification.
 */
export async function retryNotification({
  notificationId,
  email,
  phone,
  title,
  message,
}: RetryNotificationParams) {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
    select: {
      retry_count: true,
    },
  });

  if (!notification) {
    console.error(
      `[Notification] Notification ${notificationId} not found.`
    );
    return;
  }

  await processNotification({
    notificationId,
    retryCount: notification.retry_count,
    email,
    phone,
    title,
    message,
  });
}

interface ProcessNotificationParams {
  notificationId: number;
  retryCount: number;
  email?: string;
  phone?: string;
  title: string;
  message: string;
}

/**
 * Send notification through all channels and update delivery status.
 */
async function processNotification({
  notificationId,
  retryCount,
  email,
  phone,
  title,
  message,
}: ProcessNotificationParams) {
  const results = await Promise.allSettled([
    email
      ? sendEmail(email, title, message)
      : Promise.resolve({ success: true }),

    phone
      ? sendSMS(phone, message)
      : Promise.resolve({ success: true }),
  ]);

  const errors: string[] = [];

  results.forEach((result) => {
    if (result.status === "rejected") {
      errors.push(String(result.reason));
      return;
    }

    if (!result.value.success) {
      errors.push(result.value.error ?? "Unknown error");
    }
  });

  if (errors.length === 0) {
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: NotificationStatus.SENT,
        sent_at: new Date(),
        error: null,
      },
    });

    return;
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      status: NotificationStatus.FAILED,
      error: errors.join("; "),
    },
  });

  if (retryCount >= MAX_RETRIES) {
    console.error(
      `[Notification] Notification ${notificationId} failed after ${MAX_RETRIES} retries.`
    );
    return;
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      retry_count: {
        increment: 1,
      },
    },
  });

  await publishToQueue("notification.retry", {
    notificationId,
    email,
    phone,
    title,
    message,
  });

  console.log(
    `[Notification] Retry queued for notification ${notificationId} (${retryCount + 1}/${MAX_RETRIES}).`
  );
}
import { subscribeToQueue } from "../config/rabbit";
import { notify, retryNotification } from "../services/notification.service";
import { getUserById } from "../services/user.client";
import {
  orderExecutedSchema,
  paymentNotificationSchema,
  retryNotificationSchema,
} from "../validators/notification.validator";

// Handles order execution notifications
async function onOrderExecutedNotification(msg: any) {
  const { error, value } = orderExecutedSchema.validate(msg);

  if (error) {
    console.error("[Notification] Invalid order notification:", error.message);
    return;
  }

  const { userId, symbol, type, quantity, price } = value;

  const user = await getUserById(userId);

  if (!user) {
    console.error(`[Notification] User not found: ${userId}`);
    return;
  }

  await notify({
    userId,
    email: user.email,
    phone: user.phone,
    title: `Order Executed — ${type} ${symbol}`,
    message: `Your ${type} order: ${quantity} ${symbol} at ₹${price} is executed.`,
  });
}

// Handles payment notifications
async function onPaymentNotification(msg: any) {
  const { error, value } = paymentNotificationSchema.validate(msg);

  if (error) {
    console.error("[Notification] Invalid payment notification:", error.message);
    return;
  }

  const { userId, type, status, amount, provider } = value;

  const user = await getUserById(userId);

  if (!user) {
    console.error(`[Notification] User not found: ${userId}`);
    return;
  }

  await notify({
    userId,
    email: user.email,
    phone: user.phone,
    title: `Payment ${status} — ${type}`,
    message: `Your ${type} of ₹${amount} via ${provider} is ${status}.`,
  });
}

// Handles retry notifications
async function onRetryNotification(msg: any) {
  const { error, value } = retryNotificationSchema.validate(msg);

  if (error) {
    console.error("[Notification] Invalid retry message:", error.message);
    return;
  }

  await retryNotification(value);
}

// Start all RabbitMQ consumers
export async function startConsumers() {
  await subscribeToQueue(
    "order.executed.notification",
    onOrderExecutedNotification
  );
  console.log(
    "[Notification] Listening on: order.executed.notification"
  );

  await subscribeToQueue(
    "payment.notification",
    onPaymentNotification
  );
  console.log(
    "[Notification] Listening on: payment.notification"
  );

  await subscribeToQueue(
    "notification.retry",
    onRetryNotification
  );
  console.log(
    "[Notification] Listening on: notification.retry"
  );
}
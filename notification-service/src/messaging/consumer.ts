import { subscribeToQueue } from "../config/rabbit";
import { notify, retryNotification } from "../services/notification.service";
import { getUserById } from "../services/user.client";
import {
  orderExecutedSchema,
  paymentNotificationSchema,
  retryNotificationSchema,
  userSchema,
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

// Handles new user registration — phone included in event, no getUserById needed
async function onUserCreated(msg: any) {
  const { error, value } = userSchema.validate(msg);
  if (error) {
    console.error("[Notification] Invalid user.created message:", error.message);
    return;
  }
  const { userId, email, name, phone } = value;
  // phone comes from event — no extra HTTP call to auth-service
  await notify({
    userId,
    email,
    phone,
    title: `Welcome to TradePro, ${name}!`,
    message: `Your account is ready. Deposit funds and start trading.`,
  });
}

// Handles user login — sends login alert with timestamp
async function onUserLogin(msg: any) {
  const { error, value } = userSchema.validate(msg);
  if (error) {
    console.error("[Notification] Invalid user.login message:", error.message);
    return;
  }
 
  const { userId, email, name, phone } = value;
 
  await notify({
    userId,
    email,
    phone,
    title: `New login detected — ${name}`,
    message: `Your TradePro account was just logged in. If this wasn't you, contact support immediately.`,
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


// start all RabbitMQ consumers
export async function startConsumers() {
  await subscribeToQueue("order.executed.notification", onOrderExecutedNotification);
  console.log("[Notification] Listening on: order.executed.notification");

  await subscribeToQueue("payment.notification", onPaymentNotification);
  console.log("[Notification] Listening on: payment.notification");

  await subscribeToQueue("notification.retry", onRetryNotification);
  console.log("[Notification] Listening on: notification.retry");

  await subscribeToQueue("user.created", onUserCreated);
  console.log("[Notification] Listening on: user.created");

  await subscribeToQueue("user.login", onUserLogin);
  console.log("[Notification] Listening on: user.login");
}
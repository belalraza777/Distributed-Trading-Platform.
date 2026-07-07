import { subscribeToQueue } from '../config/rabbit';
import { notify } from '../services/notification.service';

// handles order.executed.notification — save + notify user their order went through
async function onOrderExecutedNotification(msg: any) {
  const { userId, symbol, type, quantity, price } = msg;
  const title = `Order Executed — ${type} ${symbol}`;
  const message = `Your ${type} order: ${quantity} ${symbol} at ₹${price} is executed.`;

  await notify(userId, email, phone, title, message);
}

//handle payment.notification — save + notify user their payment went through
async function onPaymentNotification(msg: any) {
  const { userId, type, status, amount, provider } = msg;
  const title = `Payment ${status} — ${type}`;
  const message = `Your ${type} of ₹${amount} via ${provider} is ${status}.`;

  await notify(userId, email, phone, title, message);
}


// subscribe to all queues — call once in server.ts
export async function startConsumers() {
  await subscribeToQueue('order.executed.notification', onOrderExecutedNotification);
  console.log('[Notification] Listening on: order.executed.notification');
  await subscribeToQueue('payment.notification', onPaymentNotification);
  console.log('[Notification] Listening on: payment.notification');
}
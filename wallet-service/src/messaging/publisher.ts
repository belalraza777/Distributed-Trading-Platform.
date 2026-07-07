import { publishToQueue } from '../config/rabbit';

// fires after payment is processed — notification-service listens on this queue
export async function publishPaymentNotification(data: {
    type: string,
    status: string,
    amount: number,
    provider: string,
    userId: number,
}) {
    await publishToQueue('payment.notification', data);
}
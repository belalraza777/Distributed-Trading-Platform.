import { publishToQueue } from '../config/rabbit';

// fires after order is EXECUTED — portfolio-service listens on this queue
export async function publishOrderExecuted(data: {
  userId: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}) {
  await publishToQueue('order.executed', data);
}
import { publishToQueue } from '../config/rabbit';

// Fires after order is EXECUTED — portfolio-service listens on this queue
export async function publishOrderExecuted(data: {
  userId: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}) {
  await publishToQueue('order.executed', data);
}

// Fires for internal wallet balance changes — wallet-service listens on this queue
export async function publishWalletDepositRequested(data: {
  userId: number;
  amount: number;
  description: string;
}) {
  await publishToQueue('wallet.deposit.requested', data);
}
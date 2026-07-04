import { subscribeToQueue } from '../config/rabbit';
import { internalDeposit } from '../services/wallet.service';

const WALLET_DEPOSIT_QUEUE = 'wallet.deposit.requested';

type WalletDepositMessage = {
  userId: number;
  amount: number;
  description?: string;
};

export async function startWalletConsumers() {
  await subscribeToQueue(WALLET_DEPOSIT_QUEUE, async (rawMessage) => {
    const message = JSON.parse(rawMessage) as WalletDepositMessage;

    if (!message.userId || !message.amount) {
      throw new Error('Invalid wallet deposit message');
    }

    await internalDeposit(message.userId, Number(message.amount), message.description);
  });
}
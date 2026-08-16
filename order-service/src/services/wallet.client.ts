import axios from 'axios';
import { publishWalletDepositRequested } from '../messaging/publisher';
import { ApiError } from '../middleware/error.middleware';

const WALLET_URL =
  process.env.WALLET_SERVICE_URL || 'http://localhost:3006';

const buildAuthHeaders = (userId: number, token?: string) => ({
  'x-user-id': String(userId),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Deducts funds before BUY order executes — acts as a hold on the balance
export async function lockFunds(
  userId: number,
  amount: number,
  token?: string
) {
  try {
    const res = await axios.post(
      `${WALLET_URL}/internal/withdrawal`,
      {
        amount,
        description: "Order fund lock",
      },
      {
        headers: {
          ...buildAuthHeaders(userId, token),
          "x-internal-secret":
            process.env.INTERNAL_SECRET,
        },
      }
    );

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message || error.message;

      if (status) {
        throw new ApiError(
          status,
          message || "Wallet operation failed"
        );
      }
    }

    throw error;
  }
}

// Refunds locked funds if BUY order is cancelled or fails
// This is done asynchronously to avoid blocking the order cancellation
export async function releaseFunds(
  userId: number,
  amount: number
) {
  await publishWalletDepositRequested({
    userId,
    amount,
    description: 'Order fund release',
  });

  return { queued: true };
}

// Credits wallet after SELL order executes — deposits sale proceeds
// This is done asynchronously to avoid blocking the order execution
export async function creditFunds(
  userId: number,
  amount: number
) {
  await publishWalletDepositRequested({
    userId,
    amount,
    description: 'Sale proceeds',
  });

  return { queued: true };
}
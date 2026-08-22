import axios from 'axios';
import { publishWalletDepositRequested } from '../messaging/publisher';
import { ApiError } from '../middleware/error.middleware';
import { createCircuitBreaker } from '../utils/circuit-breaker';


const WALLET_URL =
  process.env.WALLET_SERVICE_URL || 'http://localhost:3006';

const buildAuthHeaders = (userId: number, token?: string) => ({
  'x-user-id': String(userId),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// this fn is wrapped in a circuit breaker to prevent cascading failures if the wallet service is down
const requestLockFunds = async (
  userId: number,
  amount: number,
  token?: string
) => {
  try {
    const res = await axios.post(
      `${WALLET_URL}/internal/withdraw`, { amount, userId, },
      {
        headers: {
          ...buildAuthHeaders(userId, token),
          'x-internal-secret': process.env.INTERNAL_SECRET,
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
          message || 'Wallet operation failed'
        );
      }
    }
    throw error;
  }
};

// One shared breaker tracks Wallet failures across requests.
//Wrapping the requestLockFunds function in a circuit breaker to prevent cascading failures if the wallet service is down. The circuit breaker will monitor the number of failed requests to the wallet service and, if the failure rate exceeds a certain threshold, it will "trip" the circuit breaker, preventing further requests from being sent to the failing service for a specified period of time. This allows the failing service to recover and prevents overwhelming it with additional requests.
const walletBreaker = createCircuitBreaker(requestLockFunds);

walletBreaker.fallback(() => {
  throw new ApiError(
    503,
    'Wallet service is currently unavailable or experiencing high failure rates. Please try again later.'
  );
});

// Deducts funds before BUY order executes.
//This is done synchronously to ensure the user has sufficient funds before proceeding with the order
// If the wallet service is down, the circuit breaker will prevent further requests to it and return a 503 error to the client.
export async function lockFunds(
  userId: number,
  amount: number,
  token?: string
) {
  return walletBreaker.fire(userId, amount, token);
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
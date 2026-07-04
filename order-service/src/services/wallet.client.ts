import axios from 'axios';

const WALLET_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:3006';

const buildAuthHeaders = (userId: number, token?: string) => ({
  'x-user-id': String(userId),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// deducts funds before BUY order executes — acts as a hold on the balance
export async function lockFunds(userId: number, amount: number, token?: string) {
  const res = await axios.post(`${WALLET_URL}/withdraw`,
    { amount, description: 'Order fund lock' },
    { headers: buildAuthHeaders(userId, token) }
  );
  return res.data;
}

// refunds locked funds if BUY order is cancelled or fails
export async function releaseFunds(userId: number, amount: number, token?: string) {
  const res = await axios.post(`${WALLET_URL}/deposit`,
    { amount, description: 'Order fund release' },
    { headers: buildAuthHeaders(userId, token) }
  );
  return res.data;
}

// credits wallet after SELL order executes — deposits sale proceeds
export async function creditFunds(userId: number, amount: number, token?: string) {
  const res = await axios.post(`${WALLET_URL}/deposit`,
    { amount, description: 'Sale proceeds' },
    { headers: buildAuthHeaders(userId, token) }
  );
  return res.data;
}
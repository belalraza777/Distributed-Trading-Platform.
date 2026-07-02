import axios from 'axios';

const WALLET_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:3000';

// deducts funds before BUY order executes — acts as a hold on the balance
export async function lockFunds(userId: number, amount: number) {
  const res = await axios.post(`${WALLET_URL}/api/v1/wallet/withdraw`,
    { amount, description: 'Order fund lock' },
    { headers: { 'x-user-id': String(userId) } }
  );
  return res.data;
}

// refunds locked funds if BUY order is cancelled or fails
export async function releaseFunds(userId: number, amount: number) {
  const res = await axios.post(`${WALLET_URL}/api/v1/wallet/deposit`,
    { amount, description: 'Order fund release' },
    { headers: { 'x-user-id': String(userId) } }
  );
  return res.data;
}

// credits wallet after SELL order executes — deposits sale proceeds
export async function creditFunds(userId: number, amount: number) {
  const res = await axios.post(`${WALLET_URL}/api/v1/wallet/deposit`,
    { amount, description: 'Sale proceeds' },
    { headers: { 'x-user-id': String(userId) } }
  );
  return res.data;
}
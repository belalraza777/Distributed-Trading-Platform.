import axios from 'axios';

const PORTFOLIO_URL = process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3005';

// verify user holds enough quantity before allowing a SELL order
export async function getHolding(userId: number, symbol: string, token?: string) {
  const res = await axios.get(`${PORTFOLIO_URL}/${symbol}`, {
    headers: {
      'x-user-id': String(userId),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data.data; // { quantity, avg_buy_price, current_price, ... }
}
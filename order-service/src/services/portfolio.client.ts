import axios from 'axios';

const PORTFOLIO_URL = process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3002';

// verify user holds enough quantity before allowing a SELL order
export async function getHolding(userId: number, symbol: string) {
  const res = await axios.get(`${PORTFOLIO_URL}/api/v1/portfolio/${symbol}`, {
    headers: { 'x-user-id': String(userId) },
  });
  return res.data.data; // { quantity, avg_buy_price, current_price, ... }
}
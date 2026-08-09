import axios from 'axios';

const PORTFOLIO_URL =
  process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3005';

// Verify user holds enough quantity before allowing a SELL order
export async function getHolding(
  userId: number,
  symbol: string,
  token: string
) {
  try {
    const res = await axios.get(`${PORTFOLIO_URL}/${symbol}`, {
      headers: {
        'x-user-id': String(userId),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return res.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}
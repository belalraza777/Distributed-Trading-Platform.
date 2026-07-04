import axios from 'axios';

const MARKET_DATA_URL = process.env.MARKET_DATA_SERVICE_URL || 'http://localhost:3002';

// fetches the latest market price for a symbol before placing an order
export async function getLatestMarketPrice(symbol: string) {
  const normalizedSymbol = symbol.toUpperCase();
  const res = await axios.get(`${MARKET_DATA_URL}/${normalizedSymbol}/price`);
  const price = Number(res.data?.data?.price);

  if (!price || Number.isNaN(price)) {
    throw new Error(`No market price available for ${normalizedSymbol}`);
  }

  return price;
}
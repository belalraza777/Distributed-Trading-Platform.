import axios from 'axios';
import { ApiError } from '../middleware/error.middleware';

const MARKET_DATA_URL =
  process.env.MARKET_DATA_SERVICE_URL || 'http://localhost:3002';

// Fetch the latest market price for a symbol before placing an order
export async function getLatestMarketPrice(symbol: string) {
  const normalizedSymbol = symbol.toUpperCase();

  try {
    const res = await axios.get(
      `${MARKET_DATA_URL}/${normalizedSymbol}/price`
    );

    const price = Number(res.data?.data?.price);

    if (!price || Number.isNaN(price)) {
      throw new ApiError(
        404,
        `No market price available for ${normalizedSymbol}`
      );
    }

    return price;
  } catch (error) {
    // Re-throw our own business error unchanged
    if (error instanceof ApiError) {
      throw error;
    }

    // Translate Market Data Service 404 into a useful Order Service error
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new ApiError(
        404,
        `No market price available for ${normalizedSymbol}`
      );
    }

    // Don't hide unexpected errors
    throw error;
  }
}
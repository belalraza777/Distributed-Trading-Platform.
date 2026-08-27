
import api from "./Axios";

import {
  Stock,
  StockPrice,
  PriceHistory,
  CreateStockInput,
  UpdateStockInput,
} from "@/types/Market.types";

import { ApiResponse } from "@/types/Common.types";

export const marketService = {

  // Get all stocks
  async getStocks(): Promise<Stock[]> {
    const res = await api.get<ApiResponse<Stock[]>>(
      "/market-data"
    );
    return res.data.data;
  },

  // Get a specific stock by symbol
  async getStock(symbol: string): Promise<Stock> {
    const res = await api.get<ApiResponse<Stock>>(
      `/market-data/${encodeURIComponent(symbol)}`
    );
    return res.data.data;
  },

  // Get current/latest price
  async getPrice(symbol: string): Promise<StockPrice> {
    const res = await api.get<ApiResponse<StockPrice>>(
      `/market-data/${encodeURIComponent(symbol)}/price`
    );
    return res.data.data;
  },

  // Get price history
  async getHistory(
    symbol: string,
    limit = 100
  ): Promise<PriceHistory[]> {
    const res = await api.get<ApiResponse<PriceHistory[]>>(
      `/market-data/${encodeURIComponent(symbol)}/history`,
      {
        params: { limit },
      }
    )

    return res.data.data
  },

  // Search stocks
  async searchStocks(query: string): Promise<Stock[]> {
    const res = await api.get<ApiResponse<Stock[]>>(
      "/market-data/search",
      {
        params: {
          symbol: query,
        },
      }
    );
    return res.data.data;
  },

  // Create a new stock - Admin only
  async createStock(
    data: CreateStockInput
  ): Promise<Stock> {
    const res = await api.post<ApiResponse<Stock>>(
      "/market-data",
      data
    );

    return res.data.data;
  },

  // Update existing stock by ID - Admin only
  async updateStock(
    id: number,
    data: UpdateStockInput
  ): Promise<Stock> {
    const res = await api.put<ApiResponse<Stock>>(
      `/market-data/${id}`,
      data
    );

    return res.data.data;
  },

  // Delete stock by ID - Admin only
  async deleteStock(id: number): Promise<void> {
    await api.delete(`/market-data/${id}`);
  },

  // Record new price - Admin only
  async recordPrice(
    symbol: string,
    price: number
  ): Promise<StockPrice> {
    const res = await api.post<ApiResponse<StockPrice>>(
      `/market-data/${encodeURIComponent(symbol)}/price`,
      { price }
    );

    return res.data.data;
  },
};


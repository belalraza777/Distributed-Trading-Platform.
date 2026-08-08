import api from "./Axios"
import { Stock, StockPrice, PriceHistory } from "@/types/Market.types"
import { ApiResponse } from "@/types/Common.types"

export const marketService = {

  // Get all stocks
  async getStocks(): Promise<Stock[]> {
    const res = await api.get<ApiResponse<Stock[]>>("/market-data")
    return res.data.data
  },

  // Get a specific stock by symbol
  async getStock(symbol: string): Promise<Stock> {
    const res = await api.get<ApiResponse<Stock>>(`/market-data/${symbol}`)
    return res.data.data
  },

  // Get the current price of a stock by symbol
  async getPrice(symbol: string): Promise<StockPrice> {
    const res = await api.get<ApiResponse<StockPrice>>(`/market-data/${symbol}/price`)
    return res.data.data
  },

  // Get the price history of a stock by symbol
  async getHistory(symbol: string): Promise<PriceHistory[]> {
    const res = await api.get<ApiResponse<PriceHistory[]>>(`/market-data/${symbol}/history`)
    return res.data.data
  },

  // --Admin only---
  // Create a new stock
  async createStock(data: { symbol: string; name: string; description?: string }): Promise<Stock> {
    const res = await api.post<Stock>("/market-data", data)
    return res.data
  },

  // Update an existing stock by ID
  async updateStock(id: string, data: { name?: string; description?: string }): Promise<Stock> {
    const res = await api.put<Stock>(`/market-data/${id}`, data)
    return res.data
  },

  // Delete a stock by ID
  async deleteStock(id: string): Promise<void> {
    await api.delete(`/market-data/${id}`)
  },

  // Record a new price for a stock by symbol
  async recordPrice(symbol: string, price: number): Promise<void> {
    await api.post(`/market-data/${symbol}/price`, { price })
  },
}
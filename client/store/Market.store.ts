import { create } from "zustand"

import {
  Stock,
  StockPrice,
} from "@/types/Market.types"

interface MarketStore {
  stocks: Stock[]
  selectedStock: Stock | null
  latestPrice: StockPrice | null
  loading: boolean

  setStocks: (stocks: Stock[]) => void
  setSelectedStock: (stock: Stock | null) => void
  setLatestPrice: (price: StockPrice | null) => void
  setLoading: (loading: boolean) => void

  // Update live price received from Socket.IO
  updateLivePrice: (price: StockPrice) => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  stocks: [],
  selectedStock: null,
  latestPrice: null,
  loading: false,

  setStocks: (stocks) => set({ stocks }),

  setSelectedStock: (selectedStock) =>
    set({ selectedStock }),

  setLatestPrice: (latestPrice) =>
    set({ latestPrice }),

  setLoading: (loading) =>
    set({ loading }),

  updateLivePrice: (price) =>
    set((state) => {
      // Update selected stock
      let selectedStock = state.selectedStock

      if (
        selectedStock &&
        selectedStock.id === price.stock_id
      ) {
        selectedStock = {
          ...selectedStock,
          prices: [
            price,
            ...(selectedStock.prices ?? []),
          ],
        }
      }

      // Update stocks list
      const stocks = state.stocks.map((stock) => {
        if (stock.id !== price.stock_id) {
          return stock
        }

        return {
          ...stock,
          prices: [
            price,
            ...(stock.prices ?? []),
          ],
        }
      })

      return {
        stocks,
        selectedStock,
        latestPrice: price,
      }
    }),
}))
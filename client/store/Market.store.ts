import { create } from "zustand"
import { Stock, StockPrice } from "@/types/Market.types"

interface MarketStore {
  stocks: Stock[]     //List of All Stocks 
  selectedStock: Stock | null   //Currently selected stock for viewing details
  latestPrice: StockPrice | null  //Latest price of the selected stock
  loading: boolean   // Loading state
  setStocks: (stocks: Stock[]) => void
  setSelectedStock: (stock: Stock | null) => void
  setLatestPrice: (price: StockPrice | null) => void
  setLoading: (loading: boolean) => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  stocks: [],
  selectedStock: null,
  latestPrice: null,
  loading: false,
  setStocks: (stocks) => set({ stocks }),
  setSelectedStock: (selectedStock) => set({ selectedStock }),
  setLatestPrice: (latestPrice) => set({ latestPrice }),
  setLoading: (loading) => set({ loading }),
}))
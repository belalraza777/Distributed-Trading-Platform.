import { create } from "zustand"
import { Portfolio } from "@/types/Portfolio.types"

interface PortfolioStore {
  portfolio: Portfolio | null   // Currently selected portfolio
  loading: boolean   // Loading state
  setPortfolio: (portfolio: Portfolio) => void
  setLoading: (loading: boolean) => void
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  portfolio: null,
  loading: false,
  setPortfolio: (portfolio) => set({ portfolio }),
  setLoading: (loading) => set({ loading }),
}))
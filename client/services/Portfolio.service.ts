import api from "./Axios"
import { Portfolio, Holding } from "@/types/Portfolio.types"

export const portfolioService = {

  // Get the portfolio of the user
  async getPortfolio(): Promise<Portfolio> {
    const res = await api.get<Portfolio>("/portfolio")
    return res.data
  },

  // Get a specific holding by symbol
  async getHolding(symbol: string): Promise<Holding> {
    const res = await api.get<Holding>(`/portfolio/${symbol}`)
    return res.data
  },
}
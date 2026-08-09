import api from "./Axios"
import { Portfolio, Holding } from "@/types/Portfolio.types"
import { ApiResponse } from "@/types/Common.types"

export const portfolioService = {

  // Get the portfolio of the user
  async getPortfolio(): Promise<Portfolio> {
    const res = await api.get<ApiResponse<Portfolio>>("/portfolio")
    return res.data.data
  },

  // Get a specific holding by symbol
  async getHolding(symbol: string): Promise<Holding> {
    const res = await api.get<ApiResponse<Holding>>(`/portfolio/${symbol}`)
    return res.data.data
  },
}
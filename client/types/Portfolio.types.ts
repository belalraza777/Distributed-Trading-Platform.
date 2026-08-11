export interface Holding {
  id: number
  user_id: number
  symbol: string
  quantity: string
  avg_buy_price: string
  current_price: string
  current_value: number
  invested_value: number
  pnl: number
  pnl_percent: number
  created_at: string
  updated_at: string
}

export interface PortfolioSummary {
  total_invested: number
  total_current_value: number
  total_pnl: number
  total_pnl_percent: number
}

export interface Portfolio {
  holdings: Holding[]
  summary: PortfolioSummary
}
export interface Holding {
  symbol: string
  quantity: number
  averageCost: number
  currentPrice: number
  totalValue: number
  pnl: number
  pnlPercent: number
}

export interface Portfolio {
  holdings: Holding[]
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
}
export interface Stock {
  id: string
  symbol: string
  name: string
  description?: string
  createdAt: string
}

export interface StockPrice {
  id: string
  symbol: string
  price: number
  recordedAt: string
}

export interface PriceHistory {
  price: number
  recordedAt: string
}
// event payload emitted when a stock price is updated
export interface MarketPriceUpdate {
    stockId: number
    symbol: string
    price: number
    timestamp: number
}
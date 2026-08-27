
export interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  exchange: string;
  createdAt: string;
  updatedAt: string;

  // Returned when backend includes prices
  prices?: StockPrice[]
}

export interface StockPrice {
  id: number;
  stock_id: number;
  symbol: string;
  price: number;
  timestamp: string;
}

export interface PriceHistory {
  price: number;
  timestamp: string;
}

export interface CreateStockInput {
  symbol: string;
  company_name: string;
  exchange: string;
}

export interface UpdateStockInput {
  symbol?: string;
  company_name?: string;
  exchange?: string;
}

// socket.io event payload from market-data-service
export interface MarketPriceUpdate {
  stockId: number
  symbol: string
  price: number
  timestamp: number
}


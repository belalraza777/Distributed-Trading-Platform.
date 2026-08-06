export type OrderType = "BUY" | "SELL"
export type OrderStatus = "PENDING" | "EXECUTED" | "CANCELLED"

export interface Order {
  id: string
  userId: string
  symbol: string
  type: OrderType
  quantity: number
  price: number
  status: OrderStatus
  createdAt: string
}

export interface PlaceOrderPayload {
  symbol: string
  type: OrderType
  quantity: number
}
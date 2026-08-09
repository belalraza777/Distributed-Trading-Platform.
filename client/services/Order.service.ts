import api from "./Axios"
import { Order, PlaceOrderPayload } from "@/types/Order.types"
import { ApiResponse } from "@/types/Common.types"


export const orderService = {

  // Place a new order
  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>("/orders", payload)
    return res.data.data
  },

  // Get all orders for the logged-in user with pagination
  async getOrders(page = 1): Promise<{ orders: Order[]; total: number }> {
    const res = await api.get<ApiResponse<{ orders: Order[]; total: number }>>("/orders", { params: { page } })
    return res.data.data
  },

  // Get a specific order by ID
  async getOrder(id: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`)
    return res.data.data
  },

  // Cancel an order by ID
  async cancelOrder(id: string): Promise<void> {
    await api.post(`/orders/${id}/cancel`)
  },
}
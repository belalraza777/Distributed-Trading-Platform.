import api from "./Axios"
import { AdminUser, AdminStats, BanPayload } from "@/types/Admin.types"
import { Order } from "@/types/Order.types"
import { ApiResponse } from "@/types/Common.types"


// Admin service for admin-related API calls
export const adminService = {
  // Get dashboard statistics
  async getDashboard(): Promise<AdminStats> {
    const res = await api.get<ApiResponse<AdminStats>>("/admin/dashboard")
    return res.data.data
  },

  // Get all users
  async getUsers(): Promise<AdminUser[]> {
    const res = await api.get<ApiResponse<AdminUser[]>>("/admin/users")
    return res.data.data
  },
// Get a specific user by ID
  async getUser(id: string): Promise<AdminUser> {
    const res = await api.get<ApiResponse<AdminUser>>(`/admin/users/${id}`)
    return res.data.data
  },

  // Ban a user by ID with a reason
  async banUser(id: string, payload: BanPayload): Promise<void> {
    await api.post(`/admin/users/${id}/ban`, payload)
  },

  // Unban a user by ID
  async unbanUser(id: string): Promise<void> {
    await api.post(`/admin/users/${id}/unban`)
  },

  // Get all orders
  async getOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>("/admin/orders")
    return res.data.data
  },

  // Get a specific order by ID
  async getOrder(id: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`)
    return res.data.data
  },

  // Cancel an order by ID
  async cancelOrder(id: string): Promise<void> {
    await api.post(`/admin/orders/${id}/cancel`)
  },
}
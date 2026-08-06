import { create } from "zustand"
import { AdminUser, AdminStats } from "@/types/Admin.types"
import { Order } from "@/types/Order.types"

interface AdminStore {
  stats: AdminStats | null  // Admin statistics
  users: AdminUser[]   // List of users
  orders: Order[]     //list of Orders
  loading: boolean   // Loading state
  setStats: (stats: AdminStats) => void
  setUsers: (users: AdminUser[]) => void
  setOrders: (orders: Order[]) => void
  setLoading: (loading: boolean) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  stats: null,
  users: [],
  orders: [],
  loading: false,
  setStats: (stats) => set({ stats }),
  setUsers: (users) => set({ users }),
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ loading }),
}))
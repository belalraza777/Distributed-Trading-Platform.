import { create } from "zustand"
import { Order } from "@/types/Order.types"

interface OrderStore {
  orders: Order[]   //List of orders
  total: number   //Total number of orders
  loading: boolean   // Loading state
  setOrders: (orders: Order[], total: number) => void
  setLoading: (loading: boolean) => void
  updateOrder: (updated: Order) => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  total: 0,
  loading: false,
  setOrders: (orders, total) => set({ orders, total }),
  setLoading: (loading) => set({ loading }),
  updateOrder: (updated) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === updated.id ? updated : o)),
    })),
}))
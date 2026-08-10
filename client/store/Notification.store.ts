import { create } from "zustand"
import { Notification } from "@/types/Notification.types"

// stores notifications and tracks unread count for navbar bell badge

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  total: number
  loading: boolean
  setNotifications: (notifications: Notification[], total: number) => void
  markOneRead: (id: number) => void
  markAllRead: () => void
  setLoading: (loading: boolean) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,

  setNotifications: (notifications, total) =>
    set({
      notifications,
      total,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  // update single notification in store — avoids full refetch
  markOneRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      }
    }),

  // mark all as read locally — avoids full refetch
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  setLoading: (loading) => set({ loading }),
}))
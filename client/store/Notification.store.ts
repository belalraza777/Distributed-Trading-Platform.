import { create } from "zustand"
import { Notification } from "@/types/Notification.types"

interface NotificationStore {
  notifications: Notification[]   //List of notifications
  unreadCount: number   // Count of unread notifications
  loading: boolean   // Loading state
  setNotifications: (notifications: Notification[]) => void
  setLoading: (loading: boolean) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  setLoading: (loading) => set({ loading }),
}))
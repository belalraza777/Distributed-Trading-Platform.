import api from "./Axios"
import { Notification } from "@/types/Notification.types"

export const notificationService = {

  // Get all notifications for the logged-in user
  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<Notification[]>("/notifications")
    return res.data
  },
}
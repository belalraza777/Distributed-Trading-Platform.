import api from "./Axios"
import { Notification } from "@/types/Notification.types"
import { ApiResponse } from "@/types/Common.types"


export const notificationService = {

  // Get all notifications for the logged-in user
  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>("/notifications")
    return res.data.data
  },
}
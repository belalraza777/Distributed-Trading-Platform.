import api from "./Axios"
import { PaginatedNotifications } from "@/types/Notification.types"
import { ApiResponse } from "@/types/Common.types"

export const notificationService = {
  // paginated — default page 1, limit 20
  async getNotifications(page = 1, limit = 20): Promise<PaginatedNotifications> {
    const res = await api.get<PaginatedNotifications>("/notifications", {
      params: { page, limit },
    })
    return res.data
  },

  // mark a single notification as read
  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  // mark every unread notification as read at once
  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all")
  },
}
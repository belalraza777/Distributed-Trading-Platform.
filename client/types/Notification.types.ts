// matches the notification schema from notification-service

export type NotificationStatus = "PENDING" | "SENT" | "FAILED"

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  is_read: boolean       // backend uses is_read not read
  status: NotificationStatus
  sent_at: string | null
  retry_count: number
  created_at: string
}

export interface PaginatedNotifications {
  data: Notification[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}


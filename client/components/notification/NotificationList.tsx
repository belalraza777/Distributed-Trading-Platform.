"use client"

// renders notification list — highlights unread, supports mark as read on click

import { Notification } from "@/types/Notification.types"
import { formatDate } from "@/lib/utils"

interface Props {
  notifications: Notification[]
  onMarkRead: (id: number) => void
}

export default function NotificationList({ notifications, onMarkRead }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.is_read && onMarkRead(n.id)}
          className={`bg-white rounded-xl border p-4 transition ${
            n.is_read
              ? "border-gray-200 cursor-default"
              : "border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="text-xs text-gray-400">{formatDate(n.created_at)}</p>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
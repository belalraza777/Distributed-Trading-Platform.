"use client"

import { Notification } from "@/types/Notification.types"
import { formatDate } from "@/lib/utils"

interface Props {
  notifications: Notification[]
}

export default function NotificationList({ notifications }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`bg-white rounded-xl border p-4 ${
            n.read ? "border-gray-200" : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <p className="text-xs text-gray-400">{formatDate(n.createdAt)}</p>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
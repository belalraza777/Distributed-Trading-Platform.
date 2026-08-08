"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useNotificationStore } from "@/store/Notification.store"
import { MdNotifications } from "react-icons/md"

export default function Navbar() {
  const { user } = useAuth()
  const { unreadCount } = useNotificationStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
        {/* notification bell with unread count */}
        <Link href="/notifications" className="relative text-gray-500 hover:text-gray-700">
          <MdNotifications size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link href="/profile" className="text-sm text-gray-700 hover:text-blue-600">
          {user?.name}
        </Link>
      </div>
    </header>
  )
}
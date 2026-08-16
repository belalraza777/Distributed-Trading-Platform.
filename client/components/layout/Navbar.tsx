"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useNotificationStore } from "@/store/Notification.store"
import { MdNotifications } from "react-icons/md"

export default function Navbar() {
  const { user } = useAuth()
  const { unreadCount } = useNotificationStore()

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex h-full items-center justify-between">
        <div />

        <div className="flex items-center gap-2 sm:gap-4">
          {/* notification bell with unread count */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <MdNotifications
              size={22}
              className="transition-transform duration-200 group-hover:scale-105"
            />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <div className="h-7 w-px bg-gray-200" />

          <Link
            href="/profile"
            className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-medium text-gray-800 transition group-hover:text-blue-600">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400">
                View profile
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
"use client"

// notifications page — shows paginated inbox with mark as read support
// clicking an unread notification marks it read locally + calls API

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import NotificationList from "@/components/notification/NotificationList"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { notificationService } from "@/services/Notification.service"
import { useNotificationStore } from "@/store/Notification.store"
import { toast } from "sonner"

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    total,
    loading,
    setNotifications,
    setLoading,
    markOneRead,
    markAllRead,
  } = useNotificationStore()

  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const limit = 20

  async function fetchNotifications(p = 1) {
    setLoading(true)
    setError("")
    try {
      const data = await notificationService.getNotifications(p, limit)
      console.log("notifications page", data)
      setNotifications(data.data, data.pagination.total)
    } catch {
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id: number) {
    try {
      // update store immediately for instant UI feedback
      markOneRead(id)
      await notificationService.markAsRead(id)
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  async function handleMarkAllRead() {
    try {
      markAllRead()
      await notificationService.markAllAsRead()
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark all as read")
    }
  }

  useEffect(() => {
    fetchNotifications(page)
  }, [page])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={() => fetchNotifications(page)} />

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />

      {notifications.length === 0
        ? <EmptyState message="No notifications yet" />
        : <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
      }

      {/* pagination — only shown if more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-gray-600 hover:text-blue-600 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm text-gray-600 hover:text-blue-600 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
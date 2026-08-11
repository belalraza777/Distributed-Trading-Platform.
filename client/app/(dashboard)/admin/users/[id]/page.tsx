"use client"

// admin user detail page — shows full info for one user
// checks store first before hitting API

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageHeader from "@/components/layout/PageHeader"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import { adminService } from "@/services/Admin.service"
import { useAdminStore } from "@/store/Admin.store"
import { AdminUser } from "@/types/Admin.types"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { users, setUsers } = useAdminStore()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function fetchUser() {
    setLoading(true)
    setError("")
    try {
      // check store first — avoids API call if user came from users list
      const fromStore = users.find((u) => String(u.id) === id)
      if (fromStore) {
        setUser(fromStore)
      } else {
        const data = await adminService.getUser(id)
        setUser(data)
      }
    } catch {
      setError("Failed to load user")
    } finally {
      setLoading(false)
    }
  }

  async function handleBan() {
    const reason = window.prompt("Enter ban reason:")
    if (!reason || !user) return
    try {
      await adminService.banUser(id, { reason })
      const updated = { ...user, banned: true, banReason: reason }
      setUser(updated)
      // sync back to store list
      setUsers(users.map((u) => (String(u.id) === id ? updated : u)))
      toast.success("User banned")
    } catch {
      toast.error("Failed to ban user")
    }
  }

  async function handleUnban() {
    if (!user) return
    try {
      await adminService.unbanUser(id)
      const updated = { ...user, banned: false, banReason: undefined }
      setUser(updated)
      setUsers(users.map((u) => (String(u.id) === id ? updated : u)))
      toast.success("User unbanned")
    } catch {
      toast.error("Failed to unban user")
    }
  }

  useEffect(() => { fetchUser() }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchUser} />
  if (!user) return null

  return (
    <div className="max-w-lg">
      <PageHeader
        title="User Detail"
        action={
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* avatar + name */}
        <div className="flex items-center gap-4 p-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                {user.role}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user.banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              }`}>
                {user.banned ? "Banned" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* detail rows */}
        <div className="px-6 py-4 flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <span className="text-gray-900 font-medium">{user.email}</span>
        </div>

        <div className="px-6 py-4 flex justify-between text-sm">
          <span className="text-gray-500">Phone</span>
          <span className="text-gray-900 font-medium">{user.phone}</span>
        </div>

        <div className="px-6 py-4 flex justify-between text-sm">
          <span className="text-gray-500">Joined</span>
          <span className="text-gray-900 font-medium">{formatDate(user.created_at)}</span>
        </div>

        {/* ban reason — only shown if banned */}
        {user.banned && user.banReason && (
          <div className="px-6 py-4 text-sm">
            <span className="text-gray-500 block mb-1">Ban Reason</span>
            <span className="text-red-600">{user.banReason}</span>
          </div>
        )}

        {/* ban / unban action */}
        <div className="px-6 py-4">
          {user.banned ? (
            <button
              onClick={handleUnban}
              className="w-full py-2 rounded-lg border border-green-300 text-green-600 text-sm hover:bg-green-50 transition"
            >
              Unban User
            </button>
          ) : (
            <button
              onClick={handleBan}
              className="w-full py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition"
            >
              Ban User
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
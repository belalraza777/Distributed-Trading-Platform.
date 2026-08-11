"use client"

// admin users page — list all users with ban/unban actions
// ban reason collected via browser prompt — simple and no extra modal needed

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import UserTable from "@/components/admin/UserTable"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { adminService } from "@/services/Admin.service"
import { useAdminStore } from "@/store/Admin.store"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const { users, setUsers, loading, setLoading } = useAdminStore()
  const [error, setError] = useState("")

  async function fetchUsers() {
    setLoading(true)
    setError("")
    try {
      const data = await adminService.getUsers()
      setUsers(data)
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function handleBan(userId: number) {
    // simple prompt for ban reason — no modal needed
    const reason = window.prompt("Enter ban reason:")
    if (!reason) return

    try {
      await adminService.banUser(String(userId), { reason })
      // update store locally — no refetch needed
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, banned: true, banReason: reason } : u
        )
      )
      toast.success("User banned")
    } catch {
      toast.error("Failed to ban user")
    }
  }

  async function handleUnban(userId: number) {
    try {
      await adminService.unbanUser(String(userId))
      // update store locally — no refetch needed
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, banned: false, banReason: undefined } : u
        )
      )
      toast.success("User unbanned")
    } catch {
      toast.error("Failed to unban user")
    }
  }

  useEffect(() => { fetchUsers() }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchUsers} />

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} total users`}
      />

      {users.length === 0
        ? <EmptyState message="No users found" />
        : <UserTable users={users} onBan={handleBan} onUnban={handleUnban} />
      }
    </div>
  )
}
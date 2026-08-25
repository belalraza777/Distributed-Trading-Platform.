"use client"

// handles password change — clears form and calls onSuccess on completion

import { useState } from "react"
import { authService } from "@/services/Auth.service"
import { toast } from "sonner"

interface Props {
  onSuccess: () => void  // called after password changed — parent clears auth
}

export default function ChangePasswordForm({ onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function reset() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match")
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters")

    setLoading(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast.success("Password changed. Please login again.")
      reset()
      onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Password change failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}
"use client"

// handles name and phone update — calls onUpdated with new user on success

import { useState } from "react"
import { User } from "@/types/Auth.types"
import { authService } from "@/services/Auth.service"
import { toast } from "sonner"

interface Props {
  user: User
  onUpdated: (updated: User) => void
}

export default function UpdateProfileForm({ user, onUpdated }: Props) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await authService.updateProfile({ name, phone })
      onUpdated(updated)
      toast.success("Profile updated")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Update Profile</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
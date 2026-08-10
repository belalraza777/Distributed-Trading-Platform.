"use client"

// profile page — read-only view of the logged in user's details
// reads directly from auth store — no API call needed

import PageHeader from "@/components/layout/PageHeader"
import { useAuthStore } from "@/store/Auth.store"
import { formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <div className="max-w-lg">
      <PageHeader title="Profile" subtitle="Your account details" />

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* avatar + name row */}
        <div className="flex items-center gap-4 p-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.role === "ADMIN"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {user.role}
            </span>
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
          <span className="text-gray-500">Member since</span>
          <span className="text-gray-900 font-medium">{formatDate(user.created_at)}</span>
        </div>

        <div className="px-6 py-4 flex justify-between text-sm">
          <span className="text-gray-500">User ID</span>
          <span className="text-gray-400 font-mono text-xs">{user.id}</span>
        </div>

      </div>
    </div>
  )
}
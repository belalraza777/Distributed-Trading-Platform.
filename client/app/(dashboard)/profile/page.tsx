"use client"

// profile page — composes read-only card + update form + change password form

import PageHeader from "@/components/layout/PageHeader"
import UpdateProfileForm from "@/components/profile/UpdateProfileForm"
import ChangePasswordForm from "@/components/profile/ChangePasswordForm"
import { useAuthStore } from "@/store/Auth.store"
import { formatDate } from "@/lib/utils"
import { User } from "@/types/Auth.types"

export default function ProfilePage() {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore()

  if (!user) return null

  // called by UpdateProfileForm after successful update
  function handleProfileUpdated(updated: User) {
    setAuth(updated, accessToken!)
  }

  // called by ChangePasswordForm after password changed — forces re-login
  function handlePasswordChanged() {
    clearAuth()
  }

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <PageHeader title="Profile" subtitle="Manage your account" />

      {/* read-only info card */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="flex items-center gap-4 p-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            }`}>
              {user.role}
            </span>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <span className="text-gray-900 font-medium">{user.email}</span>
        </div>
        <div className="px-6 py-4 flex justify-between text-sm">
          <span className="text-gray-500">Member since</span>
          <span className="text-gray-900 font-medium">{formatDate(user.created_at)}</span>
        </div>
      </div>

      <UpdateProfileForm user={user} onUpdated={handleProfileUpdated} />
      <ChangePasswordForm onSuccess={handlePasswordChanged} />
    </div>
  )
}
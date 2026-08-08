"use client"

import Link from "next/link"
import { AdminUser } from "@/types/Admin.types"
import { formatDate } from "@/lib/utils"

interface Props {
  users: AdminUser[]
  onBan: (userId: number) => void
  onUnban: (userId: number) => void
}

export default function UserTable({ users, onBan, onUnban }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium text-gray-900">
                <Link href={`/admin/users/${user.id}`} className="hover:text-blue-600">
                  {user.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                }`}>
                  {user.banned ? "Banned" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {user.banned ? (
                  <button
                    onClick={() => onUnban(user.id)}
                    className="text-xs text-green-600 hover:underline"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    onClick={() => onBan(user.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Ban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
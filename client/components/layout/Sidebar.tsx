"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/services/Auth.service"
import { toast } from "sonner"
import {
  MdDashboard, MdShowChart, MdListAlt, MdAccountBalanceWallet,
  MdPieChart, MdNotifications, MdPerson, MdLogout
} from "react-icons/md"

const userLinks = [
  { href: "/dashboard",     label: "Dashboard",     icon: MdDashboard },
  { href: "/market",        label: "Market",        icon: MdShowChart },
  { href: "/orders",        label: "Orders",        icon: MdListAlt },
  { href: "/portfolio",     label: "Portfolio",     icon: MdPieChart },
  { href: "/wallet",        label: "Wallet",        icon: MdAccountBalanceWallet },
  { href: "/notifications", label: "Notifications", icon: MdNotifications },
  { href: "/profile",       label: "Profile",       icon: MdPerson },
]

const adminLinks = [
  { href: "/admin",         label: "Dashboard", icon: MdDashboard },
  { href: "/admin/users",   label: "Users",     icon: MdPerson },
  { href: "/admin/orders",  label: "Orders",    icon: MdListAlt },
  { href: "/admin/stocks",  label: "Stocks",    icon: MdShowChart },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, accessToken, clearAuth } = useAuth()
  const links = isAdmin ? adminLinks : userLinks

  async function handleLogout() {
    try {
      await authService.logout(accessToken!)
    } catch {
      // ignore error — still clear locally
    } finally {
      clearAuth()
      router.push("/login")
      toast.success("Logged out")
    }
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="font-bold text-blue-600 text-lg">TradePro</span>
        {isAdmin && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            Admin
          </span>
        )}
      </div>

      {/* nav links */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
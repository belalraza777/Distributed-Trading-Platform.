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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
            T
          </div>

          <span className="text-lg font-bold tracking-tight text-gray-900">
            Trade<span className="text-blue-600">Pro</span>
          </span>
        </Link>

        {isAdmin && (
          <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
            Admin
          </span>
        )}
      </div>

      {/* nav links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {isAdmin ? "Administration" : "Workspace"}
        </p>

        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-blue-50 font-semibold text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
              )}

              <Icon
                size={19}
                className={`shrink-0 transition-transform duration-200 ${
                  active
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />

              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* logout */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <MdLogout
            size={19}
            className="text-gray-400 transition group-hover:text-red-500"
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
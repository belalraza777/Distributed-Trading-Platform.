"use client"

import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"

// dashboard layout — wraps all protected pages
// sidebar on the left, navbar on top, page content on the right
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* left sidebar — fixed width */}
      <Sidebar />

      {/* right side — navbar + page content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
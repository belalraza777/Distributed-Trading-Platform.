"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/admin/StatsCard"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import { adminService } from "@/services/Admin.service"
import { useAdminStore } from "@/store/Admin.store"
import { formatCurrency } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { stats, setStats, loading, setLoading } = useAdminStore()
  const [error, setError] = useState("")

  async function fetchStats() {
    setLoading(true)
    setError("")

    try {
      const data = await adminService.getDashboard()
      console.log("Dashboard API response:", data)
      setStats(data)
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
      setError("Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  console.log("AdminDashboardPage stats:", stats)

  if (loading) return <LoadingSpinner />

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchStats} />
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview"
      />

      {/* Users stats */}
      <h2 className="text-sm font-medium text-gray-500 mb-3 mt-2">
        Users
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
        />
      </div>

      {/* Orders stats */}
      <h2 className="text-sm font-medium text-gray-500 mb-3">
        Orders
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
        />

        <StatsCard
          label="Total Volume"
          value={formatCurrency(stats?.totalVolume ?? 0)}
        />
      </div>

      {/* Wallet stats */}
      <h2 className="text-sm font-medium text-gray-500 mb-3">
        Wallet
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Total Deposits"
          value={formatCurrency(stats?.totalDeposits ?? 0)}
        />

        <StatsCard
          label="Total Withdrawals"
          value={formatCurrency(stats?.totalWithdrawals ?? 0)}
        />
      </div>
    </div>
  )
}
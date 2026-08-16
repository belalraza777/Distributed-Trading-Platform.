"use client"

import { useEffect, useCallback, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import StatsCard from "@/components/admin/StatsCard"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import { walletService } from "@/services/Wallet.service"
import { portfolioService } from "@/services/Portfolio.service"
import { orderService } from "@/services/Order.service"
import { useWalletStore } from "@/store/Wallet.store"
import { usePortfolioStore } from "@/store/Portfolio.store"
import { useOrderStore } from "@/store/Order.store"
import { useAuthStore } from "@/store/Auth.store"
import { formatCurrency, formatPnL } from "@/lib/utils"

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { balance, setBalance } = useWalletStore()
  const { portfolio, setPortfolio } = usePortfolioStore()
  const { orders, setOrders } = useOrderStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [wallet, portfolioData, ordersData] = await Promise.all([
        walletService.getBalance(),
        portfolioService.getPortfolio(),
        orderService.getOrders(),
      ])

      setBalance(wallet.balance)
      setPortfolio(portfolioData)
      setOrders(ordersData.orders, ordersData.total)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data"
      )
    } finally {
      setLoading(false)
    }
  }, [setBalance, setPortfolio, setOrders])

  useEffect(() => {
    // Everything already exists -> nothing to fetch
    if (
      balance !== null &&
      portfolio !== null &&
      orders !== null
    ) {
      return
    }

    fetchAll()
  }, [balance, portfolio, orders, fetchAll])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <ErrorMessage message={error} onRetry={fetchAll} />
      </div>
    )
  }


  const pnl = formatPnL(
    portfolio?.summary?.total_pnl ?? 0
  )

  return (
    <div className="w-full space-y-8">
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8">
        <PageHeader
          title={`Welcome back, ${user?.name} 👋`}
          subtitle="Here's your trading overview"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          <StatsCard
            label="Wallet Balance"
            value={formatCurrency(balance ?? 0)}
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          <StatsCard
            label="Portfolio Value"
            value={formatCurrency(
              portfolio?.summary?.total_current_value ?? 0
            )}
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          <StatsCard
            label="Total P&L"
            value={pnl.text}
          />
        </div>

      </div>

      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-gray-900">
            Trading Overview
          </h2>

          <p className="text-sm text-gray-500">
            Your latest account metrics at a glance.
          </p>
        </div>
      </div>
    </div>
  )
}
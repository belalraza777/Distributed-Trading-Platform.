"use client"

// dashboard — first page after login
// reads from stores first, fetches only if data is missing

import { useEffect, useState } from "react"
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

  // read from global stores — shared across all pages
  const { balance, setBalance } = useWalletStore()
  const { portfolio, setPortfolio } = usePortfolioStore()
  const { orders, setOrders } = useOrderStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchAll() {
    setLoading(true)
    setError("")
    try {
      // fetch all in parallel — save results into their respective stores
      const [wallet, portfolioData, ordersData] = await Promise.all([
        walletService.getBalance(),
        portfolioService.getPortfolio(),
        orderService.getOrders(),
      ])
      console.log("wallet", wallet)
      console.log("portfolioData", portfolioData)
      console.log("ordersData", ordersData)
      setBalance(wallet.balance)
      setPortfolio(portfolioData)
      setOrders(ordersData.orders, ordersData.total)
    } catch (error) {
      setError(error?.toString() || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }
console.log("balance", balance)
console.log("portfolio", portfolio)
console.log("orders", orders)
  useEffect(() => {
    // only fetch if stores are empty — avoids redundant API calls on revisit
    if (!portfolio || orders === null || balance === null) fetchAll()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchAll} />

  const openOrders = orders?.filter((o) => o?.status === "PENDING").length
  const pnl = formatPnL(portfolio?.totalPnL ?? 0)

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name} 👋`}
        subtitle="Here's your trading overview"
      />

      {/* four stat cards — each value pulled from its own global store */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Wallet Balance" value={formatCurrency(balance)} />
        <StatsCard label="Portfolio Value" value={formatCurrency(portfolio?.totalValue ?? 0)} />
        <StatsCard label="Total P&L" value={pnl.text} />
        <StatsCard label="Open Orders" value={openOrders} />
      </div>
    </div>
  )
}
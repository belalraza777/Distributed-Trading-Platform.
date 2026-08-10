"use client"

// portfolio page — shows all holdings with average cost and P&L
// fetches fresh on every visit since prices change constantly

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import HoldingsTable from "@/components/portfolio/HoldingsTable"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { portfolioService } from "@/services/Portfolio.service"
import { usePortfolioStore } from "@/store/Portfolio.store"
import { formatCurrency, formatPnL, formatPercent } from "@/lib/utils"

export default function PortfolioPage() {
  const { portfolio, setPortfolio, loading, setLoading } = usePortfolioStore()
  const [error, setError] = useState("")

  async function fetchPortfolio() {
    setLoading(true)
    setError("")
    try {
      const data = await portfolioService.getPortfolio()
      setPortfolio(data)
    } catch {
      setError("Failed to load portfolio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // always refresh — current prices and P&L change with market
    fetchPortfolio()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchPortfolio} />

  const pnl = formatPnL(portfolio?.totalPnL ?? 0)

  return (
    <div>
      <PageHeader title="Portfolio" subtitle="Your current holdings and performance" />

      {/* summary row — total value and overall P&L */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(portfolio?.totalValue ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total P&L</p>
          <p className={`text-xl font-bold mt-1 ${pnl.colorClass}`}>
            {pnl.text}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Return</p>
          <p className={`text-xl font-bold mt-1 ${pnl.colorClass}`}>
            {formatPercent(portfolio?.totalPnLPercent ?? 0)}
          </p>
        </div>
      </div>

      {/* holdings table or empty state */}
      {!portfolio || portfolio.holdings.length === 0
        ? <EmptyState message="No holdings yet. Place a BUY order to get started." />
        : <HoldingsTable holdings={portfolio.holdings} />
      }
    </div>
  )
}
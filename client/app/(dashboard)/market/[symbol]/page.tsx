"use client"

// stock detail page — shows stock info, latest price, and buy/sell form
// price is always fetched fresh — not cached in store since it changes often

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import PageHeader from "@/components/layout/PageHeader"
import StockCard from "@/components/market/StockCard"
import BuySellForm from "@/components/market/BuySellForm"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import { marketService } from "@/services/Market.service"
import { useMarketStore } from "@/store/Market.store"
import { StockPrice } from "@/types/Market.types"

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()

  // try to find stock in store first — avoids refetch if user came from market page
  const { stocks, selectedStock, setSelectedStock } = useMarketStore()

  const [price, setPrice] = useState<StockPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function fetchData() {
    setLoading(true)
    setError("")
    try {
      // use stock from store if available, otherwise fetch from API
      const stockFromStore = stocks.find((s) => s.symbol === symbol)

      const [stockData, priceData] = await Promise.all([
        stockFromStore ? Promise.resolve(stockFromStore) : marketService.getStock(symbol),
        marketService.getPrice(symbol),
      ])

      setSelectedStock(stockData)
      setPrice(priceData)
    } catch {
      setError(`Failed to load data for ${symbol}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // clear selected stock on unmount — keeps store clean
    return () => setSelectedStock(null)
  }, [symbol])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />
  if (!selectedStock) return null

  return (
    <div>
      <PageHeader
        title={selectedStock.symbol}
        subtitle={selectedStock.name}
      />

      {/* two column layout — stock info on left, buy/sell form on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StockCard stock={selectedStock} price={price} />
        </div>
        <div>
          <BuySellForm symbol={symbol} />
        </div>
      </div>
    </div>
  )
}
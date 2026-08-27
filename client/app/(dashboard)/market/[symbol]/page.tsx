"use client"

import { useEffect, useState } from "react"

import { useParams } from "next/navigation"

import PageHeader from "@/components/layout/PageHeader"
import StockCard from "@/components/market/StockCard"
import BuySellForm from "@/components/market/BuySellForm"
import PriceHistory from "@/components/market/PriceHistory"

import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"

import { marketService } from "@/services/Market.service"
import { useMarketStore } from "@/store/Market.store"
import { useMarketSocket } from "@/hooks/useMarketSocket"

import { PriceHistory as PriceHistoryType } from "@/types/Market.types"

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()

  // Keep latest price updated through Socket.IO
  useMarketSocket()

  const stocks = useMarketStore(
    (state) => state.stocks
  )

  const selectedStock = useMarketStore(
    (state) => state.selectedStock
  )

  // Live price comes from Zustand / Socket.IO
  const latestPrice = useMarketStore(
    (state) => state.latestPrice
  )

  const setSelectedStock = useMarketStore(
    (state) => state.setSelectedStock
  )

  const setLatestPrice = useMarketStore(
    (state) => state.setLatestPrice
  )

  // Historical prices are kept separately
  const [history, setHistory] = useState<
    PriceHistoryType[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError("")

      try {
        // Reuse stock from Zustand when available
        const stockFromStore = stocks.find(
          (stock) => stock.symbol === symbol
        )

        // Fetch initial stock, current price and history
        const [
          stockData,
          priceData,
          historyData,
        ] = await Promise.all([
          stockFromStore
            ? Promise.resolve(stockFromStore)
            : marketService.getStock(symbol),

          marketService.getPrice(symbol),

          marketService.getHistory(symbol, 100),
        ])

        if (cancelled) return

        // Set stock information
        setSelectedStock({
          ...stockData,
          prices: [
            priceData,
            ...(stockData.prices ?? []),
          ],
        })

        // Set initial/latest price
        setLatestPrice(priceData)

        // Set historical prices
        setHistory(historyData)
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError(
            `Failed to load data for ${symbol}`
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true

      // Clean page-specific state
      setSelectedStock(null)
      setLatestPrice(null)
      setHistory([])
    }
  }, [
    symbol,
    setSelectedStock,
    setLatestPrice,
  ])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!selectedStock) {
    return null
  }

  return (
    <div>
      <PageHeader
        title={selectedStock.symbol}
        subtitle={
          selectedStock.company_name ||
          "No company name available"
        }
      />

      {/* Stock + Buy/Sell */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockCard
            stock={selectedStock}
            price={latestPrice}
          />
        </div>

        <div>
          <BuySellForm symbol={symbol} />
        </div>
      </div>

      {/* Price history */}
      <div className="mt-6">
        <PriceHistory prices={history} />
      </div>
    </div>
  )
}
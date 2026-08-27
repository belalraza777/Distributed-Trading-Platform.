"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import StockTable from "@/components/market/StockTable"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { marketService } from "@/services/Market.service"
import { useMarketStore } from "@/store/Market.store"
import { useDebounce } from "@/hooks/useDebounce"
import { useMarketSocket } from "@/hooks/useMarketSocket"


export default function MarketPage() {
  const { stocks, setStocks, loading, setLoading } = useMarketStore()

  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  // connect socket — auto disconnects on unmount
  useMarketSocket()

  // Debounce the search input to avoid excessive filtering on every keystroke
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    // Fetch stocks only if the store is empty
    async function fetchStocks() {
      setLoading(true)
      setError("")

      try {
        const data = await marketService.getStocks()
        setStocks(data)
      } catch {
        setError("Failed to load stocks")
      } finally {
        setLoading(false)
      }
    }
    if (stocks.length === 0) {
      fetchStocks()
    }
  }, [stocks.length, setLoading, setStocks])

  // Filter stocks based on the debounced search term
  const filtered = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div>
      <PageHeader title="Market" />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by symbol or name..."
        className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      {filtered.length === 0 ? (
        <EmptyState message="No stocks found" />
      ) : (
        <StockTable stocks={filtered} />
      )}
    </div>
  )
}
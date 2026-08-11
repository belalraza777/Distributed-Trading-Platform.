"use client"

import { useState } from "react"
import { marketService } from "@/services/Market.service"
import { toast } from "sonner"

interface Props {
  onCreated: () => void
}

export default function StockForm({ onCreated }: Props) {
  const [symbol, setSymbol] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [exchange, setExchange] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!symbol.trim() || !companyName.trim() || !exchange.trim()) {
      return toast.error("Symbol, company name, and exchange are required")
    }

    setLoading(true)

    try {
      await marketService.createStock({
        symbol: symbol.trim().toUpperCase(),
        company_name: companyName.trim(),
        exchange: exchange.trim().toUpperCase(),
      })

      toast.success(`Stock ${symbol.trim().toUpperCase()} created`)

      setSymbol("")
      setCompanyName("")
      setExchange("")

      onCreated()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create stock"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">
        Add New Stock
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol (e.g. AAPL)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />

        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name (e.g. Apple Inc.)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          placeholder="Exchange (e.g. NASDAQ)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />

        <button
          type="submit"
          disabled={loading}
          className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Stock"}
        </button>
      </form>
    </div>
  )
}


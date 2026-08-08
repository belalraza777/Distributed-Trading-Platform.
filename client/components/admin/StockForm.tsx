"use client"

import { useState } from "react"
import { marketService } from "@/services/Market.service"
import { toast } from "sonner"

interface Props {
  onCreated: () => void
}

export default function StockForm({ onCreated }: Props) {
  const [symbol, setSymbol] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!symbol || !name) return toast.error("Symbol and name are required")

    setLoading(true)
    try {
      await marketService.createStock({ symbol: symbol.toUpperCase(), name, description })
      toast.success(`Stock ${symbol.toUpperCase()} created`)
      setSymbol("")
      setName("")
      setDescription("")
      onCreated()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Add New Stock</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol (e.g. AAPL)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company name"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
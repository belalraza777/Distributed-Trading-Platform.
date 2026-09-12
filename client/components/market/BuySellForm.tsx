"use client"

import { useState } from "react"
import { OrderType } from "@/types/Order.types"
import { orderService } from "@/services/Order.service"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Props {
  symbol: string
  currentPrice: number | null
}

export default function BuySellForm({ symbol, currentPrice }: Props) {
    
  const [type, setType] = useState<OrderType>("BUY")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)

  const parsedQuantity = Number(quantity)
  const estimatedTotal =
    currentPrice !== null && parsedQuantity > 0
      ? currentPrice * parsedQuantity
      : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = parseInt(quantity)
    if (!qty || qty <= 0) return toast.error("Enter a valid quantity")

    setLoading(true)
    try {
      await orderService.placeOrder({ symbol, type, quantity: qty })
      toast.success(`${type} order placed for ${qty} ${symbol}`)
      setQuantity("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Order failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Place Order</h3>

      {/* BUY / SELL toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-4">
        {(["BUY", "SELL"] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2 text-sm font-medium transition ${
              type === t
                ? t === "BUY" ? "bg-blue-600 text-white" : "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span>Current price</span>
            <span className="font-medium text-gray-700">
              {currentPrice !== null ? formatCurrency(currentPrice) : "—"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between font-semibold text-gray-900">
            <span>Estimated total</span>
            <span>{estimatedTotal !== null ? formatCurrency(estimatedTotal) : "—"}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Final price is confirmed at execution</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-sm font-medium text-white transition ${
            type === "BUY" ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
          } disabled:opacity-60`}
        >
          {loading ? "Placing..." : `Place ${type} Order`}
        </button>
      </form>
    </div>
  )
}
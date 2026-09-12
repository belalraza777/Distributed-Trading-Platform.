"use client"

import { useEffect, useState } from "react"
import { Order } from "@/types/Order.types"
import StatusBadge from "@/components/common/StatusBadge"
import { formatCurrency, formatDate, formatPnL } from "@/lib/utils"
import { orderService } from "@/services/Order.service"
import { marketService } from "@/services/Market.service"
import { portfolioService } from "@/services/Portfolio.service"
import { toast } from "sonner"

interface Props {
  order: Order
  onCancelled: (updated: Order) => void
}

export default function OrderDetail({ order, onCancelled }: Props) {
  const [loading, setLoading] = useState(false)
  const [averagePrice, setAveragePrice] = useState<number | null>(null) // average buy price for SELL orders
  const [currentPrice, setCurrentPrice] = useState<number | null>(null) // current market price for BUY orders

  // Load the current price (for BUY orders) or average buy price (for SELL orders) when the component mounts.
  useEffect(() => {
    let active = true

    async function loadPriceDetails() {
      try {
        if (order.type === "BUY") {
          // BUY orders use the live market price to calculate P/L.
          const result = await marketService.getPrice(order.symbol)
          if (active) setCurrentPrice(Number(result.price))
          return
        }

        // SELL orders use the average buy price to calculate P/L.
        const result = await portfolioService.getHolding(order.symbol)
        if (active) setAveragePrice(Number(result.avg_buy_price))
      } catch {
        // Price data is optional, so the order details remain usable if it fails.
      }
    }

    loadPriceDetails()

    return () => {
      active = false
    }
  }, [order.symbol, order.type])

  const orderPriceLabel = order.type === "BUY" ? "Buy Price" : "Sell Price"
  // BUY: current price - buy price; SELL: sell price - average buy price.
  const priceDifference = order.type === "BUY"
    ? currentPrice === null ? null : currentPrice - order.price
    : averagePrice === null ? null : order.price - averagePrice
  // Total P/L is the per-unit difference multiplied by the order quantity.
  const profitOrLoss = priceDifference === null ? null : priceDifference * order.quantity
  const formattedProfitOrLoss = profitOrLoss === null ? null : formatPnL(profitOrLoss)
  const formattedPriceDifference = priceDifference === null ? null : formatPnL(priceDifference)

  // Cancel the order — only available for PENDING orders.
  async function handleCancel() {
    setLoading(true)
    try {
      await orderService.cancelOrder(order.id)
      toast.success("Order cancelled")
      onCancelled({ ...order, status: "CANCELLED" })
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined
      toast.error(message || "Cancel failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{order.symbol}</h2>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Type</p>
          <StatusBadge status={order.type} />
        </div>
        <div>
          <p className="text-gray-400">Quantity</p>
          <p className="font-medium text-gray-900">{order.quantity}</p>
        </div>
        <div>
          <p className="text-gray-400">{orderPriceLabel}</p>
          <p className="font-medium text-gray-900">{formatCurrency(order.price)}</p>
        </div>
        {order.type === "BUY" ? (
          <>
            <div>
              <p className="text-gray-400">Current Price</p>
              <p className="font-medium text-gray-900">
                {currentPrice === null ? "—" : formatCurrency(currentPrice)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Difference</p>
              <p className={`font-medium ${formattedPriceDifference?.colorClass ?? "text-gray-400"}`}>
                {formattedPriceDifference?.text ?? "—"}
              </p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-gray-400">Average Buy Price</p>
            <p className="font-medium text-gray-900">
              {averagePrice === null ? "—" : formatCurrency(averagePrice)}
            </p>
          </div>
        )}
        <div>
          <p className="text-gray-400">Total</p>
          <p className="font-medium text-gray-900">{formatCurrency(order.price * order.quantity)}</p>
        </div>
        <div>
          <p className="text-gray-400">Profit / Loss</p>
          <p className={`font-medium ${formattedProfitOrLoss?.colorClass ?? "text-gray-400"}`}>
            {formattedProfitOrLoss?.text ?? "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Date</p>
          <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Only pending orders can be cancelled. */}
      {order.status === "PENDING" && (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="mt-2 w-full py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition disabled:opacity-60"
        >
          {loading ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  )
}
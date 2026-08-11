"use client"

import { useState } from "react"
import { Order } from "@/types/Order.types"
import StatusBadge from "@/components/common/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { orderService } from "@/services/Order.service"
import { toast } from "sonner"

interface Props {
  order: Order
  onCancelled: (updated: Order) => void
}

export default function OrderDetail({ order, onCancelled }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      await orderService.cancelOrder(order.id)
      toast.success("Order cancelled")
      onCancelled({ ...order, status: "CANCELLED" })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cancel failed")
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
          <p className="text-gray-400">Price</p>
          <p className="font-medium text-gray-900">{formatCurrency(order.price)}</p>
        </div>
        <div>
          <p className="text-gray-400">Total</p>
          <p className="font-medium text-gray-900">{formatCurrency(order.price * order.quantity)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Date</p>
          <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* cancel button — only for PENDING orders */}
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
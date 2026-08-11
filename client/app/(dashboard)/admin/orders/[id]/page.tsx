"use client"

// admin order detail page — full info for one order with force cancel option
// checks admin store first before hitting API

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageHeader from "@/components/layout/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import { adminService } from "@/services/Admin.service"
import { useAdminStore } from "@/store/Admin.store"
import { Order } from "@/types/Order.types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { orders, setOrders } = useAdminStore()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)

  async function fetchOrder() {
    setLoading(true)
    setError("")
    try {
      // check admin store first — avoids API call if coming from orders list
      const fromStore = orders.find((o) => o.id === id)
      if (fromStore) {
        setOrder(fromStore)
      } else {
        const data = await adminService.getOrder(id)
        setOrder(data)
      }
    } catch {
      setError("Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!order) return
    setCancelling(true)
    try {
      await adminService.cancelOrder(id)
      const updated = { ...order, status: "CANCELLED" as const }
      setOrder(updated)
      // sync back to admin orders store list
      setOrders(orders.map((o) => (o.id === id ? updated : o)))
      toast.success("Order cancelled")
    } catch {
      toast.error("Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchOrder} />
  if (!order) return null

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Order Detail"
        action={
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{order.symbol}</h2>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Type</p>
            <StatusBadge status={order.type} />
          </div>
          <div>
            <p className="text-gray-400 mb-1">Quantity</p>
            <p className="font-medium text-gray-900">{order.quantity}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Price</p>
            <p className="font-medium text-gray-900">{formatCurrency(order.price)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Total</p>
            <p className="font-medium text-gray-900">{formatCurrency(order.price * order.quantity)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">User ID</p>
            <p className="font-mono text-xs text-gray-500">{order.userId}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Date</p>
            <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* force cancel — only for PENDING orders */}
        {order.status === "PENDING" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-2 w-full py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition disabled:opacity-60"
          >
            {cancelling ? "Cancelling..." : "Force Cancel Order"}
          </button>
        )}
      </div>
    </div>
  )
}
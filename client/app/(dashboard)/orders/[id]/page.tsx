"use client"

// order detail page — shows full info for a single order
// checks store first to avoid refetch, falls back to API if not found

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import PageHeader from "@/components/layout/PageHeader"
import OrderDetail from "@/components/order/OrderDetail"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import { orderService } from "@/services/Order.service"
import { useOrderStore } from "@/store/Order.store"
import { Order } from "@/types/Order.types"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { orders, updateOrder } = useOrderStore()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function fetchOrder() {
    setLoading(true)
    setError("")
    try {
      // check store first — avoids API call if user came from orders list
      const fromStore = orders.find((o) => o.id === id)
      if (fromStore) {
        setOrder(fromStore)
      } else {
        const data = await orderService.getOrder(id)
        setOrder(data)
      }
    } catch {
      setError("Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  // called by OrderDetail when user cancels — updates both local and store
  function handleCancelled(updated: Order) {
    setOrder(updated)
    updateOrder(updated)
  }

  useEffect(() => { fetchOrder() }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchOrder} />
  if (!order) return null

  return (
    <div className="max-w-lg">
      <PageHeader title="Order Detail" />
      <OrderDetail order={order} onCancelled={handleCancelled} />
    </div>
  )
}
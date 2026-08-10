"use client"

// orders page — shows full order history for the logged in user
// reads from store first, fetches only if store is empty

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import OrderTable from "@/components/order/OrderTable"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { orderService } from "@/services/Order.service"
import { useOrderStore } from "@/store/Order.store"

export default function OrdersPage() {
  const { orders, setOrders, loading, setLoading } = useOrderStore()
  const [error, setError] = useState("")

  async function fetchOrders() {
    setLoading(true)
    setError("")
    try {
      const data = await orderService.getOrders()
      setOrders(data.orders, data.total)
    } catch {
      setError("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // always refresh orders — status can change (PENDING → EXECUTED)
    fetchOrders()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Your full order history"
      />

      {orders.length === 0
        ? <EmptyState message="No orders yet. Go to Market to place your first order." />
        : <OrderTable orders={orders} />
      }
    </div>
  )
}
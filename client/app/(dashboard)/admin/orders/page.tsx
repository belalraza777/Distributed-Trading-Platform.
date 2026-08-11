"use client"

// admin orders page — view all platform orders, force cancel pending ones
// always fetches fresh — order statuses change constantly

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import AdminOrderTable from "@/components/admin/AdminOrderTable"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { adminService } from "@/services/Admin.service"
import { useAdminStore } from "@/store/Admin.store"
import { toast } from "sonner"

export default function AdminOrdersPage() {
  const { orders, setOrders, loading, setLoading } = useAdminStore()
  const [error, setError] = useState("")

  async function fetchOrders() {
    setLoading(true)
    setError("")
    try {
      const data = await adminService.getOrders()
      setOrders(data)
    } catch {
      setError("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(orderId: string) {
    try {
      await adminService.cancelOrder(orderId)
      // update store locally — avoids full refetch
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" as const } : o
        )
      )
      toast.success("Order cancelled")
    } catch {
      toast.error("Failed to cancel order")
    }
  }

  useEffect(() => { fetchOrders() }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
      />

      {orders.length === 0
        ? <EmptyState message="No orders found" />
        : <AdminOrderTable orders={orders} onCancel={handleCancel} />
      }
    </div>
  )
}
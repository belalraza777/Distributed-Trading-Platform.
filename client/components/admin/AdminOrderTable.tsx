"use client"

import Link from "next/link"
import { Order } from "@/types/Order.types"
import StatusBadge from "@/components/common/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Props {
  orders: Order[]
  onCancel: (orderId: string) => void
}

export default function AdminOrderTable({ orders, onCancel }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Symbol</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Qty</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-semibold text-gray-900">
                <Link href={`/admin/orders/${order.id}`} className="hover:text-blue-600">
                  {order.symbol}
                </Link>
              </td>
              <td className="px-4 py-3"><StatusBadge status={order.type} /></td>
              <td className="px-4 py-3 text-gray-700">{order.quantity}</td>
              <td className="px-4 py-3 text-gray-700">{formatCurrency(order.price)}</td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                {order.status === "PENDING" && (
                  <button
                    onClick={() => onCancel(order.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
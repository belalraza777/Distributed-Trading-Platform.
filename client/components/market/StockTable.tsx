"use client"

import Link from "next/link"
import { Stock } from "@/types/Market.types"

interface Props {
  stocks: Stock[]
}

export default function StockTable({ stocks }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Symbol</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stocks.map((stock) => (
            <tr key={stock.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-semibold text-gray-900">{stock.symbol}</td>
              <td className="px-4 py-3 text-gray-600">{stock.name}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/market/${stock.symbol}`}
                  className="text-blue-600 hover:underline text-xs font-medium"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
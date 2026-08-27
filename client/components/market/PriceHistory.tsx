"use client"

import { PriceHistory as PriceHistoryType } from "@/types/Market.types"

interface Props {
  prices: PriceHistoryType[]
}

export default function PriceHistory({ prices }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Price History
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Recent market prices
        </p>
      </div>

      {prices.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-500">
          No price history available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Date
                </th>

                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Time
                </th>

                <th className="text-right px-5 py-3 font-medium text-gray-500">
                  Price
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {prices.map((item, index) => {
                const date = new Date(item.timestamp)

                return (
                  <tr
                    key={`${item.timestamp}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-gray-600">
                      {date.toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3 text-gray-600">
                      {date.toLocaleTimeString()}
                    </td>

                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                      ${Number(item.price).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
"use client"

import { Holding } from "@/types/Portfolio.types"
import { formatCurrency, formatPnL, formatPercent } from "@/lib/utils"

interface Props {
  holdings: Holding[]
}

export default function HoldingsTable({ holdings }: Props) {
  console.log("holdings", holdings)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">
              Symbol
            </th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">
              Qty
            </th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">
              Avg Cost
            </th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">
              Current
            </th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">
              Value
            </th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">
              P&L
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {holdings.map((h) => {
            const { text, colorClass } = formatPnL(h.pnl)

            return (
              <tr
                key={h.symbol}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {h.symbol}
                </td>

                <td className="px-4 py-3 text-right text-gray-700">
                  {h.quantity}
                </td>

                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(Number(h.avg_buy_price))}
                </td>

                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(Number(h.current_price))}
                </td>

                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(h.current_value)}
                </td>

                <td className={`px-4 py-3 text-right font-medium ${colorClass}`}>
                  {text} ({formatPercent(h.pnl_percent)})
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
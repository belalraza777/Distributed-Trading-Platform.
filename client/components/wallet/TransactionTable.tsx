"use client"

import { WalletTransaction } from "@/types/Wallet.types"
import StatusBadge from "@/components/common/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Props {
  transactions: WalletTransaction[]
}

export default function TransactionTable({ transactions }: Props) {

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Provider</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${tx.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}`}>
                  {tx.type === "DEPOSIT" ? "+" : "-"}{tx.type}
                </span>
              </td>
              <td className={`px-4 py-3 font-medium ${tx.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}`}>
                {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(Number(tx.amount))}              </td>
              <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
              <td className="px-4 py-3 text-gray-500 text-xs">{tx.provider}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(tx.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
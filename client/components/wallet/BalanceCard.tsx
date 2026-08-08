"use client"

import { formatCurrency } from "@/lib/utils"

interface Props {
  balance: number
}

export default function BalanceCard({ balance }: Props) {
  return (
    <div className="bg-blue-600 rounded-xl p-6 text-white">
      <p className="text-sm text-blue-100">Available Balance</p>
      <p className="text-4xl font-bold mt-1">{formatCurrency(balance)}</p>
    </div>
  )
}
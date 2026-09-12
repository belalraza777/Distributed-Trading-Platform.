"use client"

import { formatCurrency } from "@/lib/utils"

interface Props {
  balance: number
}

export default function BalanceCard({ balance }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#2457d6] p-6 text-white shadow-lg shadow-blue-100">
      <div className="relative z-10">
        <p className="text-sm text-blue-100">Available Balance</p>
        <p className="display-font mt-2 text-4xl font-bold">{formatCurrency(balance)}</p>
      </div>
    </div>
  )
}
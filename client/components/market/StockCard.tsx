"use client"

import { Stock, StockPrice } from "@/types/Market.types"
import { formatCurrency } from "@/lib/utils"

interface Props {
  stock: Stock
  price: StockPrice | null
}

export default function StockCard({ stock, price }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{stock.symbol}</h2>
          <p className="text-sm text-gray-500">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {price ? formatCurrency(price.price) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Latest price</p>
        </div>
      </div>
      {stock.description && (
        <p className="text-sm text-gray-500 mt-3 border-t border-gray-100 pt-3">
          {stock.description}
        </p>
      )}
    </div>
  )
}
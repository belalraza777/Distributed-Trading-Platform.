
"use client"

// admin stocks page — create, update, delete stocks and record prices
// prices are included in stock response — no separate price fetch needed

import { useEffect, useState, Fragment  } from "react"

import PageHeader from "@/components/layout/PageHeader"
import StockForm from "@/components/admin/StockForm"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"

import { marketService } from "@/services/Market.service"
import { useMarketStore } from "@/store/Market.store"
import { Stock } from "@/types/Market.types"

import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

// Backend returns prices sorted by timestamp DESC
// and take: 1, so prices[0] is the latest price.
function getLatestPrice(stock: Stock): string {
  if (!stock.prices || stock.prices.length === 0) {
    return "No price"
  }

  const latest = stock.prices[0]

  return formatCurrency(latest.price)
}

export default function AdminStocksPage() {
  const {
    stocks,
    setStocks,
    loading,
    setLoading,
  } = useMarketStore()

  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  // Edit state
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [editCompanyName, setEditCompanyName] = useState("")
  const [editExchange, setEditExchange] = useState("")
  const [updating, setUpdating] = useState(false)

  // Price state
  const [pricingStock, setPricingStock] = useState<Stock | null>(null)
  const [newPrice, setNewPrice] = useState("")
  const [recordingPrice, setRecordingPrice] = useState(false)

  async function fetchStocks() {
    setLoading(true)
    setError("")

    try {
      const data = await marketService.getStocks()
      setStocks(data)
    } catch {
      setError("Failed to load stocks")
    } finally {
      setLoading(false)
    }
  }

  function startEdit(stock: Stock) {
    cancelPrice()

    setEditingStock(stock)
    setEditCompanyName(stock.company_name)
    setEditExchange(stock.exchange)
  }

  function cancelEdit() {
    setEditingStock(null)
    setEditCompanyName("")
    setEditExchange("")
  }

  function startPrice(stock: Stock) {
    cancelEdit()

    setPricingStock(stock)
    setNewPrice("")
  }

  function cancelPrice() {
    setPricingStock(null)
    setNewPrice("")
  }

  async function handleUpdate(stock: Stock) {
    const companyName = editCompanyName.trim()
    const exchange = editExchange.trim()

    if (!companyName) {
      toast.error("Company name is required")
      return
    }

    if (!exchange) {
      toast.error("Exchange is required")
      return
    }

    setUpdating(true)

    try {
      const updated = await marketService.updateStock(
        stock.id,
        {
          company_name: companyName,
          exchange: exchange,
        }
      )

      setStocks(
        stocks.map((s) =>
          s.id === updated.id ? updated : s
        )
      )

      cancelEdit()

      toast.success(`${stock.symbol} updated`)
    } catch {
      toast.error("Failed to update stock")
    } finally {
      setUpdating(false)
    }
  }

  async function handleRecordPrice(stock: Stock) {
    const price = Number(newPrice)

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid price")
      return
    }

    setRecordingPrice(true)

    try {
      await marketService.recordPrice(
        stock.symbol,
        price
      )

      // Refetch because backend returns prices
      // with the stock response.
      await fetchStocks()

      cancelPrice()

      toast.success(
        `Price ₹${price} recorded for ${stock.symbol}`
      )
    } catch {
      toast.error("Failed to record price")
    } finally {
      setRecordingPrice(false)
    }
  }

  async function handleDelete(id: number) {
    if (
      !window.confirm(
        "Are you sure you want to delete this stock?"
      )
    ) {
      return
    }

    try {
      await marketService.deleteStock(id)

      setStocks(
        stocks.filter((stock) => stock.id !== id)
      )

      toast.success("Stock deleted")
    } catch {
      toast.error("Failed to delete stock")
    }
  }

  async function handleCreated() {
    setShowForm(false)
    await fetchStocks()
  }

  useEffect(() => {
    fetchStocks()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchStocks}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Stocks"
        subtitle={`${stocks.length} stocks listed`}
        action={
          <button
            onClick={() => {
              setShowForm((value) => !value)
              cancelEdit()
              cancelPrice()
            }}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showForm ? "Cancel" : "+ Add Stock"}
          </button>
        }
      />

      {showForm && (
        <div className="mb-6">
          <StockForm onCreated={handleCreated} />
        </div>
      )}

      {stocks.length === 0 ? (
        <EmptyState message="No stocks listed yet. Add one above." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Symbol
                </th>

                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Company
                </th>

                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Exchange
                </th>

                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Current Price
                </th>

                <th className="text-right px-4 py-3 text-gray-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>


            <tbody className="divide-y divide-gray-100">
              {stocks.map((stock) => (
                <Fragment key={stock.id}>
                  {/* Stock row */}
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {stock.symbol}
                    </td>

                    {editingStock?.id === stock.id ? (
                      <>
                        {/* Company */}
                        <td className="px-4 py-2">
                          <input
                            value={editCompanyName}
                            onChange={(e) =>
                              setEditCompanyName(e.target.value)
                            }
                            placeholder="Company name"
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Exchange */}
                        <td className="px-4 py-2">
                          <input
                            value={editExchange}
                            onChange={(e) =>
                              setEditExchange(e.target.value)
                            }
                            placeholder="Exchange"
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-gray-400">
                          {getLatestPrice(stock)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleUpdate(stock)}
                              disabled={updating}
                              className="text-xs text-blue-600 hover:underline disabled:opacity-60"
                            >
                              {updating ? "Saving..." : "Save"}
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Company */}
                        <td className="px-4 py-3 text-gray-700">
                          {stock.company_name}
                        </td>

                        {/* Exchange */}
                        <td className="px-4 py-3 text-gray-500">
                          {stock.exchange}
                        </td>

                        {/* Current Price */}
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {getLatestPrice(stock)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => startPrice(stock)}
                              className="text-xs text-green-600 hover:underline"
                            >
                              + Price
                            </button>

                            <button
                              onClick={() => startEdit(stock)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(stock.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Record price row */}
                  {pricingStock?.id === stock.id && (
                    <tr className="bg-green-50 border-t border-green-100">
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-xs text-green-700 font-medium"
                      >
                        Record new price for {stock.symbol}
                      </td>

                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={newPrice}
                          onChange={(e) =>
                            setNewPrice(e.target.value)
                          }
                          placeholder="Enter price (₹)"
                          className="w-full border border-green-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </td>

                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleRecordPrice(stock)}
                            disabled={recordingPrice}
                            className="text-xs text-green-600 hover:underline disabled:opacity-60"
                          >
                            {recordingPrice ? "Recording..." : "Record"}
                          </button>

                          <button
                            onClick={cancelPrice}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>


          </table>
        </div>
      )}
    </div>
  )
}


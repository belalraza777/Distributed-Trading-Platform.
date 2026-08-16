"use client"

// deposit form — backend always returns Razorpay order
// opens Razorpay checkout for every deposit — webhook credits wallet on success

import { useState } from "react"
import { walletService } from "@/services/Wallet.service"
import { DepositOrder } from "@/types/Wallet.types"
import { toast } from "sonner"
import RazorpayCheckout from "./RazorpayCheckout"

export default function DepositForm() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  // holds order details returned by backend — passed to RazorpayCheckout
  const [order, setOrder] = useState<DepositOrder | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return toast.error("Enter a valid amount")

    setLoading(true)
    try {
      const result = await walletService.deposit({ amount: amt })
      // backend always returns { transaction, order } — open Razorpay with order
      setOrder(result.order)
      setAmount("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Deposit failed")
    } finally {
      setLoading(false)
    }
  }

  function handleSuccess() {
    setOrder(null)
    toast.success("Payment successful! Balance will update shortly.")
  }

  function handleFailure() {
    setOrder(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Deposit</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₹)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !!order}
          className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      </form>

      {/* mounts only when order is available — triggers Razorpay checkout immediately */}
      {order && (
        <RazorpayCheckout
          order={order}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
        />
      )}
    </div>
  )
}
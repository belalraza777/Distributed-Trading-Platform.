"use client"

import { useState } from "react"
import { walletService } from "@/services/Wallet.service"
import { useWalletStore } from "@/store/Wallet.store"
import { toast } from "sonner"

export default function DepositForm() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { setBalance } = useWalletStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return toast.error("Enter a valid amount")

    setLoading(true)
    try {
      const result = await walletService.deposit({ amount: amt })

      if ("orderId" in result) {
        // RAZORPAY — open checkout (handled by parent if needed)
        toast.info("Redirecting to payment...")
      } else {
        // INTERNAL — balance updated immediately
        setBalance(result.balance)
        toast.success("Deposit successful")
        setAmount("")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Deposit failed")
    } finally {
      setLoading(false)
    }
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
          disabled={loading}
          className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      </form>
    </div>
  )
}
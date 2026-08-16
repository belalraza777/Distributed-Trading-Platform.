"use client"

// Razorpay checkout — opens automatically when order is passed
// key comes from backend response — no env var needed

import { useEffect, useState } from "react"
import { walletService } from "@/services/Wallet.service"
import { useAuthStore } from "@/store/Auth.store"
import { DepositOrder } from "@/types/Wallet.types"
import { toast } from "sonner"

// declare Razorpay on window object
declare global {
  interface Window { Razorpay: any }
}

//Load Razorpay script dynamically — returns true if loaded successfully
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}


interface Props {
  order: DepositOrder      // { orderId, key, amount, currency } from backend
  onSuccess: () => void
  onFailure: () => void
}

export default function RazorpayCheckout({ order, onSuccess, onFailure }: Props) {
  const { user } = useAuthStore()
  const [error, setError] = useState("")

  useEffect(() => {
    async function openCheckout() {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError("Failed to load Razorpay. Please try again.")
        onFailure()
        return
      }

      const options = {
        key: order.key,              // key comes from backend — no env var needed
        amount: order.amount,        // already in paise from backend
        currency: order.currency,
        name: "TradePro",
        description: "Wallet Deposit",
        order_id: order.orderId,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },
        theme: { color: "#2563eb" },

        handler: async function (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) {
          try {
            // verify signature — wallet credit happens via webhook after this
            await walletService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            onSuccess()
          } catch {
            toast.error("Verification failed — contact support if amount was deducted")
            onFailure()
          }
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled")
            onFailure()
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.")
        onFailure()
      })
      rzp.open()
    }

    openCheckout()
  }, [order.orderId])

  if (!error) return null
  return <p className="text-sm text-red-500 mt-2">{error}</p>
}
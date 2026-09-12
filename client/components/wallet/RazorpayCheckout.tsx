"use client"

// Razorpay checkout — opens automatically when order is passed
// key comes from backend response — no env var needed

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
  onSuccess: () => void | Promise<void>
  onFailure: () => void
}

export default function RazorpayCheckout({ order, onSuccess, onFailure }: Props) {
  const { user } = useAuthStore()
  const router = useRouter()
  const paymentCompleted = useRef(false)
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
            // Verify the signature before treating the payment as successful.
            await walletService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          } catch {
            toast.error("Verification failed — contact support if amount was deducted")
            onFailure()
            return
          }

          try {
            paymentCompleted.current = true
            await onSuccess()
          } catch {
            toast.info("Payment received. Your balance will refresh shortly.")
          }

          router.replace("/wallet?payment=success")
        },

        modal: {
          ondismiss: () => {
            if (paymentCompleted.current) return
            toast.info("Payment cancelled")
            onFailure()
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => {
        if (paymentCompleted.current) return
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
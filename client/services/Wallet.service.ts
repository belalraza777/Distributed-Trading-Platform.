import api from "./Axios"
import {
  WalletBalance,
  WalletTransaction,
  DepositPayload,
  DepositResponse,
  VerifyPaymentPayload,
  WithdrawPayload,
  WithdrawResponse,
} from "@/types/Wallet.types"
import { ApiResponse } from "@/types/Common.types"


export const walletService = {

  // Get the current wallet balance
  async getBalance(): Promise<WalletBalance> {
    const res = await api.get<ApiResponse<WalletBalance>>("/wallet/balance")
    return res.data.data
  },

  // INTERNAL → returns { balance }
  // RAZORPAY → returns { orderId, amount, currency } — pass orderId to Razorpay checkout
  async deposit(payload: DepositPayload): Promise<DepositResponse> {
    const res = await api.post<ApiResponse<DepositResponse>>("/wallet/deposit", payload)
    return res.data.data
  },

  // called after Razorpay checkout completes in the browser
  // verifies signature — does NOT update wallet (webhook does that)
  async verifyPayment(payload: VerifyPaymentPayload): Promise<void> {
    await api.post("/wallet/verify-payment", payload)
  },

  // INTERNAL → returns { balance }
  async withdraw(payload: WithdrawPayload): Promise<WithdrawResponse> {
    const res = await api.post<ApiResponse<WithdrawResponse>>("/wallet/withdraw", payload)
    return res.data.data
  },

  // Get all wallet transactions for the logged-in user
  async getTransactions(): Promise<WalletTransaction[]> {
    const res = await api.get<ApiResponse<WalletTransaction[]>>("/wallet/transactions")
    return res.data.data
  },
}
import api from "./Axios"
import { ApiResponse } from "@/types/Common.types"
import {
  WalletBalance,
  WalletTransaction,
  TransactionsResponse,
  DepositPayload,
  DepositResponse,
  VerifyPaymentPayload,
  WithdrawPayload,
  WithdrawResponse,
} from "@/types/Wallet.types"

export const walletService = {
  async getBalance(): Promise<WalletBalance> {
    const res = await api.get<ApiResponse<WalletBalance>>("/wallet/balance")
    return res.data.data
  },

  // backend always returns { transaction, order } — Razorpay order included
  async deposit(payload: DepositPayload): Promise<DepositResponse> {
    const res = await api.post<ApiResponse<DepositResponse>>("/wallet/deposit", payload)
    return res.data.data
  },

  async verifyPayment(payload: VerifyPaymentPayload): Promise<void> {
    await api.post("/wallet/verify-payment", payload)
  },

  async withdraw(payload: WithdrawPayload): Promise<WithdrawResponse> {
    const res = await api.post<ApiResponse<WithdrawResponse>>("/wallet/withdraw", payload)
    return res.data.data
  },

  async getTransactions(): Promise<TransactionsResponse> {
    const res = await api.get<ApiResponse<TransactionsResponse>>("/wallet/transactions")
    return res.data.data
  },
}
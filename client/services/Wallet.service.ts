import api from "./Axios"
import { ApiResponse } from "@/types/Common.types"
import {
  WalletBalance,
  WalletTransaction,
  DepositPayload,
  DepositResponse,
  VerifyPaymentPayload,
  WithdrawPayload,
  WithdrawResponse,
  TransactionsResponse
} from "@/types/Wallet.types"

export const walletService = {
  async getBalance(): Promise<WalletBalance> {
    const res = await api.get<ApiResponse<WalletBalance>>("/wallet/balance")
    return res.data.data
  },

  async deposit(payload: DepositPayload): Promise<DepositResponse> {
    const res = await api.post<ApiResponse<DepositResponse>>("/wallet/deposit", payload)
    return res.data.data
  },

  async verifyPayment(payload: VerifyPaymentPayload): Promise<void> {
    await api.post<ApiResponse<null>>("/wallet/verify-payment", payload)
  },

  async withdraw(payload: WithdrawPayload): Promise<WithdrawResponse> {
    const res = await api.post<ApiResponse<WithdrawResponse>>("/wallet/withdraw", payload)
    return res.data.data
  },

  async getTransactions(): Promise<WalletTransaction[]> {
    const res = await api.get<ApiResponse<TransactionsResponse>>("/wallet/transactions")
    return res.data.data.transactions
  },
}
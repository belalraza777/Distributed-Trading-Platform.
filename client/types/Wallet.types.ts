export type TransactionType = "DEPOSIT" | "WITHDRAW"
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED"
export type PaymentProvider = "INTERNAL" | "RAZORPAY"

export interface WalletTransaction {
  id: number
  wallet_id: number
  type: TransactionType
  amount: string           // backend returns amount as string
  status: TransactionStatus
  provider: PaymentProvider
  providerPaymentId?: string
  created_at: string
}

export interface WalletBalance {
  balance: number
}

export interface DepositPayload {
  amount: number
}

// actual backend deposit response shape
export interface DepositOrder {
  orderId: string
  key: string              // Razorpay key included in response
  amount: number           // in paise
  currency: string
}

export interface DepositResponse {
  transaction: WalletTransaction
  order: DepositOrder
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface WithdrawPayload {
  amount: number
}

export interface WithdrawResponse {
  balance: number
}

export interface TransactionsResponse {
  transactions: WalletTransaction[]
  total: number
  page: number
  limit: number
}
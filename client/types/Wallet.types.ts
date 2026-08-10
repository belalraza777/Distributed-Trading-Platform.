export type TransactionType = "DEPOSIT" | "WITHDRAW"
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED"
export type PaymentProvider = "INTERNAL" | "RAZORPAY"

export interface Wallet {
  id: string
  userId: string
  balance: number
}

export interface WalletTransaction {
  id: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  provider: PaymentProvider
  providerPaymentId?: string
  createdAt: string
}

export interface WalletBalance {
  balance: number
}

// POST /deposit — INTERNAL returns balance, RAZORPAY returns order details
export interface DepositPayload {
  amount: number
}

export interface InternalDepositResponse {
  balance: number
}

export interface RazorpayDepositResponse {
  orderId: string        // Razorpay order_id — passed to Razorpay checkout
  amount: number
  currency: string
}

export type DepositResponse = InternalDepositResponse | RazorpayDepositResponse

// POST /verify-payment — called after Razorpay checkout completes
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

// actual shape returned by GET /wallet/transactions
export interface TransactionsResponse {
  transactions: WalletTransaction[]
  total: number
  page: number
  limit: number
}
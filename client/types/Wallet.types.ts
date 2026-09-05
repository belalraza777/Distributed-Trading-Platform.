export type TransactionType = "DEPOSIT" | "WITHDRAW"
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED"
export type PaymentProvider = "INTERNAL" | "RAZORPAY"

export interface WalletTransaction {
  id: number
  wallet_id: number
  type: TransactionType
  amount: string
  status: TransactionStatus
  provider: PaymentProvider
  providerPaymentId?: string
  createdAt: string
}

// actual backend shape for GET /wallet/balance
export interface WalletBalance {
  wallet_id: number
  user_id: number
  balance: string    // backend returns balance as string — parse with parseFloat()
}

export interface DepositPayload {
  amount: number
}

export interface DepositOrder {
  orderId: string
  key: string
  amount: number
  currency: string
}

export interface DepositResponse {
  transaction: WalletTransaction
  balance?: string | number
  order?: DepositOrder
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface WithdrawPayload {
  amount: number
}

export interface WithdrawResponse {
  balance: string
}

export interface TransactionsResponse {
  transactions: WalletTransaction[]
  total: number
  page: number
  limit: number
}

// bank account — account_number comes masked from backend: "******1234"
export interface BankAccount {
  id: number
  account_holder: string
  account_number: string  // masked
  ifsc_code: string
  bank_name?: string
  created_at: string
  updated_at: string
}

export interface BankAccountPayload {
  account_holder: string
  account_number: string  // plain — sent to backend, never stored in state
  ifsc_code: string
  bank_name?: string
}
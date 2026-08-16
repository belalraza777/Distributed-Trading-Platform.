"use client"

import { useEffect, useState } from "react"
import PageHeader from "@/components/layout/PageHeader"
import BalanceCard from "@/components/wallet/BalanceCard"
import DepositForm from "@/components/wallet/DepositForm"
import WithdrawForm from "@/components/wallet/WithdrawForm"
import TransactionTable from "@/components/wallet/TransactionTable"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { walletService } from "@/services/Wallet.service"
import { useWalletStore } from "@/store/Wallet.store"

export default function WalletPage() {
  const {
    balance,
    transactions,
    setBalance,
    setTransactions,
    loading,
    setLoading,
  } = useWalletStore()

  const [error, setError] = useState("")

  async function fetchWallet() {
    setLoading(true)
    setError("")

    try {
      const [balanceData, txData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ])

      setBalance(balanceData.balance)
      // txData is TransactionsResponse — extract .transactions array for store
      setTransactions(txData.transactions)
    } catch {
      setError("Failed to load wallet")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <ErrorMessage message={error} onRetry={fetchWallet} />
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <PageHeader
        title="Wallet"
        subtitle="Manage your funds and view your transaction history"
      />

      {/* Balance */}
      <section>
        <BalanceCard balance={balance} />
      </section>

      {/* Deposit / Withdraw */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Funds
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add funds to your wallet or withdraw your available balance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <DepositForm />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <WithdrawForm />
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review your recent wallet activity
              </p>
            </div>

            {Array.isArray(transactions) && transactions.length > 0 && (
              <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {transactions.length}{" "}
                {transactions.length === 1 ? "transaction" : "transactions"}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {!Array.isArray(transactions) || transactions.length === 0 ? (
            <div className="py-8">
              <EmptyState message="No transactions yet" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TransactionTable transactions={transactions} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
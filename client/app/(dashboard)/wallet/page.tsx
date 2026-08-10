"use client"

// wallet page — shows balance, deposit/withdraw forms, and transaction history
// balance and transactions always refreshed — money changes frequently

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
  const { balance, transactions, setBalance, setTransactions, loading, setLoading } = useWalletStore()
  const [error, setError] = useState("")

  async function fetchWallet() {
    setLoading(true)
    setError("")
    try {
      // fetch balance and transactions in parallel
      const [balanceData, txData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ])
      setBalance(balanceData.balance)
      setTransactions(txData)
    } catch {
      setError("Failed to load wallet")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // always refresh wallet — balance changes after every trade or deposit
    fetchWallet()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchWallet} />

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Manage your funds" />

      {/* balance card spans full width */}
      <div className="mb-6">
        <BalanceCard balance={balance} />
      </div>

      {/* deposit and withdraw side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <DepositForm />
        <WithdrawForm />
      </div>

      {/* transaction history below */}
      <h2 className="text-base font-semibold text-gray-900 mb-3">Transaction History</h2>
      {transactions.length === 0
        ? <EmptyState message="No transactions yet" />
        : <TransactionTable transactions={transactions} />
      }
    </div>
  )
}
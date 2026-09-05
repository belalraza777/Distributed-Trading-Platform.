"use client"

// wallet page — balance, deposit/withdraw, bank account, transaction history

import { useEffect, useState, useRef } from "react"
import PageHeader from "@/components/layout/PageHeader"
import BalanceCard from "@/components/wallet/BalanceCard"
import DepositForm from "@/components/wallet/DepositForm"
import WithdrawForm from "@/components/wallet/WithdrawForm"
import TransactionTable from "@/components/wallet/TransactionTable"
import BankAccountCard from "@/components/wallet/BankAccountCard"
import BankAccountForm from "@/components/wallet/BankAccountForm"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorMessage from "@/components/common/ErrorMessage"
import EmptyState from "@/components/common/EmptyState"
import { walletService } from "@/services/Wallet.service"
import { useWalletStore } from "@/store/Wallet.store"
import { BankAccount, BankAccountPayload } from "@/types/Wallet.types"
import { toast } from "sonner"


export default function WalletPage() {
  const { balance, transactions, setBalance, setTransactions, loading, setLoading } = useWalletStore()

  const [error, setError] = useState("")
  const fetched = useRef(false)

  // bank account state — null means not loaded yet, undefined means no account
  const [bankAccount, setBankAccount] = useState<BankAccount | null | undefined>(null)
  const [addingAccount, setAddingAccount] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)

  async function fetchWallet() {
    setLoading(true)
    setError("")
    try {
      const [balanceData, txData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ])
      setBalance(balanceData.balance)
      setTransactions(txData.transactions)
    } catch {
      setError("Failed to load wallet")
    } finally {
      setLoading(false)
    }
  }

  async function fetchBankAccount() {
    try {
      const data = await walletService.getBankAccount()
      setBankAccount(data)
      console.log("Bank account fetched:", data)
    } catch {
      // 404 means no bank account — that's fine
      setBankAccount(undefined)
    }
  }

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchWallet()
    fetchBankAccount()
  }, [])

  async function handleCreateBankAccount(data: BankAccountPayload) {
    setSavingAccount(true)
    try {
      const created = await walletService.createBankAccount(data)
      setBankAccount(created)
      setAddingAccount(false)
      toast.success("Bank account added")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add bank account")
    } finally {
      setSavingAccount(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={fetchWallet} />

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Manage your funds" />

      {/* balance */}
      <div className="mb-6">
        <BalanceCard balance={balance} />
      </div>

      {/* deposit and withdraw */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <DepositForm />
        <WithdrawForm />
      </div>

      {/* bank account section */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Bank Account</h2>

        {/* has bank account — show card */}
        {bankAccount && (
          <BankAccountCard
            account={bankAccount}
            onUpdated={(updated) => setBankAccount(updated)}
            onDeleted={() => setBankAccount(undefined)}
          />
        )}

        {/* no bank account — show add button or form */}
        {bankAccount === undefined && (
          addingAccount ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Add Bank Account</h3>
              <BankAccountForm
                loading={savingAccount}
                onSubmit={handleCreateBankAccount}
                onCancel={() => setAddingAccount(false)}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-5 flex flex-col items-center gap-3">
              <p className="text-sm text-gray-500">No bank account added yet</p>
              <button
                onClick={() => setAddingAccount(true)}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                + Add Bank Account
              </button>
            </div>
          )
        )}
      </div>

      {/* transaction history */}
      <h2 className="text-base font-semibold text-gray-900 mb-3">Transaction History</h2>
      {!Array.isArray(transactions) || transactions.length === 0
        ? <EmptyState message="No transactions yet" />
        : <TransactionTable transactions={transactions} />
      }
    </div>
  )
}
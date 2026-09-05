"use client"

// shows existing bank account with edit and delete options
// switches to form mode for editing

import { useState } from "react"
import { BankAccount, BankAccountPayload } from "@/types/Wallet.types"
import { walletService } from "@/services/Wallet.service"
import BankAccountForm from "./BankAccountForm"
import { toast } from "sonner"
import { MdAccountBalance, MdEdit, MdDelete } from "react-icons/md"

interface Props {
  account: BankAccount
  onUpdated: (updated: BankAccount) => void
  onDeleted: () => void
}

export default function BankAccountCard({ account, onUpdated, onDeleted }: Props) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleUpdate(data: BankAccountPayload) {
    setLoading(true)
    try {
      const updated = await walletService.updateBankAccount(data)
      onUpdated(updated)
      setEditing(false)
      toast.success("Bank account updated")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete your bank account?")) return
    setDeleting(true)
    try {
      await walletService.deleteBankAccount()
      onDeleted()
      toast.success("Bank account deleted")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed")
    } finally {
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Update Bank Account</h3>
        <BankAccountForm
          initial={account}
          loading={loading}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MdAccountBalance size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Bank Account</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <MdEdit size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-600 disabled:opacity-60"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </div>

      {/* account details */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Account Holder</span>
          <span className="text-gray-900 font-medium">{account.account_holder}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Account Number</span>
          {/* masked from backend — shows ******1234 */}
          <span className="text-gray-900 font-mono font-medium">{account.account_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">IFSC Code</span>
          <span className="text-gray-900 font-medium">{account.ifsc_code}</span>
        </div>
        {account.bank_name && (
          <div className="flex justify-between">
            <span className="text-gray-500">Bank</span>
            <span className="text-gray-900 font-medium">{account.bank_name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
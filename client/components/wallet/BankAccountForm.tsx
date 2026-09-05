"use client"

// form for creating or updating bank account
// mode prop controls whether it shows create or update labels

import { useState } from "react"
import { BankAccountPayload } from "@/types/Wallet.types"

interface Props {
  initial?: BankAccountPayload
  loading: boolean
  onSubmit: (data: BankAccountPayload) => void
  onCancel?: () => void
}

export default function BankAccountForm({ initial, loading, onSubmit, onCancel }: Props) {
  const [accountHolder, setAccountHolder] = useState(initial?.account_holder ?? "")
  const [accountNumber, setAccountNumber] = useState("")  // never pre-fill — masked on backend
  const [ifscCode, setIfscCode] = useState(initial?.ifsc_code ?? "")
  const [bankName, setBankName] = useState(initial?.bank_name ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      account_holder: accountHolder,
      account_number: accountNumber,
      ifsc_code: ifscCode.toUpperCase(),
      bank_name: bankName || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Account Holder Name</label>
        <input
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          placeholder="As per bank records"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter account number"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">IFSC Code</label>
        <input
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
          placeholder="e.g. SBIN0001234"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Bank Name (optional)</label>
        <input
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g. State Bank of India"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
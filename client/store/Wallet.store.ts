import { create } from "zustand"
import { WalletTransaction } from "@/types/Wallet.types"

interface WalletStore {
  balance: number   // Current wallet balance
  transactions: WalletTransaction[]   // List of wallet transactions
  loading: boolean  // Loading state
  setBalance: (balance: number) => void
  setTransactions: (transactions: WalletTransaction[]) => void
  setLoading: (loading: boolean) => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  balance: 0,
  transactions: [],
  loading: false,
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading }),
}))
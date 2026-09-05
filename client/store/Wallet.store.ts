import { create } from "zustand"
import { WalletTransaction } from "@/types/Wallet.types"

interface WalletStore {
  balance: number
  transactions: WalletTransaction[]
  loading: boolean
  setBalance: (balance: number | string) => void  // accepts both — parses internally
  setTransactions: (transactions: WalletTransaction[]) => void
  setLoading: (loading: boolean) => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  balance: 0,
  transactions: [],
  loading: false,
  setBalance: (balance) => set({ balance: parseFloat(String(balance)) }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading }),
}))
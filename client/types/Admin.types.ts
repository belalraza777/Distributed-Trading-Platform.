import { User } from "./Auth.types"
import { Order } from "./Order.types"

export interface AdminUser extends User {
  banned: boolean
  banReason?: string
}

export interface AdminStats {
  users: { total: number }
  orders: { total: number; totalVolume: number }
  wallet: { totalDeposits: number; totalWithdrawals: number }
}

export interface BanPayload {
  reason: string
}

export type { User, Order }
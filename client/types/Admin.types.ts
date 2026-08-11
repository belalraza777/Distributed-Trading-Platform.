
import { User } from "./Auth.types"
import { Order } from "./Order.types"

export interface AdminUser extends User {
  banned: boolean
  banReason?: string
}

export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalVolume: number
  totalDeposits: number
  totalWithdrawals: number
}

export interface BanPayload {
  reason: string
}

export type { User, Order }


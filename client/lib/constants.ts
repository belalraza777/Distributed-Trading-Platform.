// base URL for all API calls — comes from .env.local
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// user roles — must match what your backend sends in JWT
export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const

// polling intervals in milliseconds
export const POLL = {
  PRICES: 10_000,        // market prices — every 10 seconds
  NOTIFICATIONS: 15_000, // notifications — every 15 seconds
  BALANCE: 30_000,       // wallet balance — every 30 seconds
  ORDERS: 10_000,        // order status — every 10 seconds
  ADMIN: 30_000,         // admin dashboard — every 30 seconds
} as const

// localStorage key for access token
export const ACCESS_TOKEN_KEY = "trading_access_token"
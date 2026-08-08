// base URL for all API calls — comes from .env.local
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// user roles — must match what your backend sends in JWT
export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const


// localStorage key for access token
export const ACCESS_TOKEN_KEY = "trading_access_token"
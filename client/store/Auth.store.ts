import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "@/types/Auth.types"

// key used to store accessToken in localStorage
const ACCESS_TOKEN_KEY = "trading_access_token"

interface AuthStore {
  user: User | null    //Logged in user information
  accessToken: string | null   //Access token for authentication
  isLoggedIn: boolean   // Indicates if the user is logged in
  isAdmin: boolean     // Indicates if the logged-in user is an admin
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  updateAccessToken: (accessToken: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      isAdmin: false,

      // called after login or register
      setAuth: (user, accessToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        set({ user, accessToken, isLoggedIn: true, isAdmin: user.role === "ADMIN" })
      },

      // called after logout
      clearAuth: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        set({ user: null, accessToken: null, isLoggedIn: false, isAdmin: false })
      },

      // called after token refresh — only updates the token, not the user
      updateAccessToken: (accessToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        set({ accessToken })
      },
    }),
    { name: "auth-store" }
  )
)

export { ACCESS_TOKEN_KEY }
import { useAuthStore } from "@/store/auth.store"

// reads auth store — use this in components instead of importing store directly
export function useAuth() {
  const { user, accessToken, isLoggedIn, isAdmin, setAuth, clearAuth, updateAccessToken } = useAuthStore()
  return { user, accessToken, isLoggedIn, isAdmin, setAuth, clearAuth, updateAccessToken }
}
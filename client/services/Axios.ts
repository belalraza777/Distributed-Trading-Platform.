import axios from "axios"
import { API_URL, ACCESS_TOKEN_KEY } from "@/lib/constants"

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // needed so httpOnly refreshToken cookie is sent automatically
})

// attach accessToken to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// handle 401 — try to refresh token once, then redirect to login
let isRefreshing = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // if 401 and we haven't retried yet — try refreshing the token
    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true
      isRefreshing = true

      try {
        // POST /auth/refresh — refreshToken cookie sent automatically
        const res = await api.post<{ accessToken: string }>("/auth/refresh")
        const newToken = res.data.accessToken

        // save new token and update auth store
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken)
        original.headers.Authorization = `Bearer ${newToken}`

        isRefreshing = false
        return api(original) // retry the original failed request
      } catch {
        // refresh also failed — clear everything and go to login
        isRefreshing = false
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api
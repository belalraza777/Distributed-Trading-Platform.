import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios"
import { API_URL, ACCESS_TOKEN_KEY } from "@/lib/constants"

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  accessToken: string
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false

type QueuedRequest = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let failedQueue: QueuedRequest[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Only handle unauthorized responses
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error)
    }

    // If another request is already refreshing the token,
    // wait for it and retry this request afterward.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await api.post<RefreshResponse>("/auth/refresh")

      const newAccessToken = response.data.accessToken

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint")
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)

      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)

      localStorage.removeItem(ACCESS_TOKEN_KEY)

      window.location.href = "/login"

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api;


 /*
                 API REQUEST
                      │
                      ▼
             Access token added
                      │
                      ▼
                 API SERVER
                  /       \
                200       401
                │          │
                ▼          ▼
              Done     Is refreshing?
                         /       \
                       YES       NO
                        │         │
                        ▼         ▼
                     Queue    Refresh token
                                  │
                            ┌─────┴─────┐
                            │           │
                         Success      Failed
                            │           │
                            ▼           ▼
                       New token      Logout
                            │
                            ▼
                     Retry requests       
      */
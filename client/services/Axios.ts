import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_URL, ACCESS_TOKEN_KEY } from "@/lib/constants";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    // No request config available
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Don't refresh if:
    // - response isn't 401
    // - request has already been retried
    // - this is the refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Prevent multiple simultaneous refresh requests
    if (isRefreshing) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Refresh token is stored in an httpOnly cookie.
      // withCredentials:true sends it automatically.
      const response = await api.post<RefreshResponse>(
        "/auth/refresh"
      );

      const newAccessToken = response.data.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint");
      }

      // Store new access token
      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        newAccessToken
      );

      // Update Authorization header for retry
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — user must log in again
      localStorage.removeItem(ACCESS_TOKEN_KEY);

      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
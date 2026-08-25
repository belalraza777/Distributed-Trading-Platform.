import api from "./Axios"
import { AuthResponse, LoginPayload, RegisterPayload, RefreshResponse, User } from "@/types/Auth.types"
import { ApiResponse } from "@/types/Common.types"

export const authService = {
  // Register a new user
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", payload)
    return res.data
  },

  // Login a user and get access and refresh tokens
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", payload)
    return res.data
  },

  // Refresh the access token using the refresh token
  async refresh(): Promise<RefreshResponse> {
    const res = await api.post<RefreshResponse>("/auth/refresh")
    return res.data
  },

  // Logout a user by invalidating the refresh token
  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken })
  },

  // Get the profile of the currently logged-in user
  async getProfile(): Promise<User> {
    const res = await api.get<User>("/auth/profile")
    return res.data
  },

  // update name and/or phone
  async updateProfile(data: { name?: string; phone?: string }): Promise<User> {
    const res = await api.patch<ApiResponse<User>>("/auth/profile", data)
    return res.data.data
  },

  // verify current password then set new one
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch("/auth/change-password", { currentPassword, newPassword })
  },
}
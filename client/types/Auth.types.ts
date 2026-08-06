export interface User {
  id: number
  name: string
  email: string
  role: "USER" | "ADMIN"
  phone: string
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
}
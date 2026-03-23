import type { User, UserRole } from '@/types'

import { api } from './api'

export interface SendOtpPayload {
  phone: string
}

export interface VerifyOtpPayload {
  phone: string
  code: string
}

export interface RegisterPayload {
  phone: string
  name: string
  role: UserRole
  city?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface VerifyOtpResponse {
  user: User | null
  accessToken: string | null
  refreshToken: string
}

export const authService = {
  sendOtp: (payload: SendOtpPayload) => api.post<{ expiresIn: number }>('/auth/otp/send', payload),

  verifyOtp: (payload: VerifyOtpPayload) => api.post<VerifyOtpResponse>('/auth/otp/verify', payload),

  register: (payload: RegisterPayload) => api.post<AuthResponse>('/auth/register', payload),

  refreshToken: (refreshToken: string) => api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  getMe: () => api.get<User>('/auth/me'),

  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken })
}

import apiClient from './client'
import type { AuthResponse } from '@/types/me'

export function login(email: string, password: string) {
  return apiClient.post<AuthResponse>('/auth/login', { email, password })
}

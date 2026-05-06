import apiClient from './client'
import type { Me, UpdateMeRequest, ChangePasswordRequest, MeStats } from '@/types/me'

export function getMyProfile() {
  return apiClient.get<Me>('/me')
}

export function updateMyProfile(data: UpdateMeRequest) {
  return apiClient.put<Me>('/me', data)
}

export function changeMyPassword(data: ChangePasswordRequest) {
  return apiClient.put('/me/password', data)
}

export function deleteMyAvatar() {
  return apiClient.delete('/me/avatar')
}

export function getMyStats() {
  return apiClient.get<MeStats>('/me/stats')
}

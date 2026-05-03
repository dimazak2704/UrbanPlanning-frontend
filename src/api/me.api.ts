import apiClient from './client'
import type { MyProfile, MyProfileUpdateRequest, PasswordChangeRequest, MyStats } from '@/types/me'

export function getMyProfile() {
  return apiClient.get<MyProfile>('/me')
}

export function updateMyProfile(data: MyProfileUpdateRequest) {
  return apiClient.put<MyProfile>('/me', data)
}

export function changeMyPassword(data: PasswordChangeRequest) {
  return apiClient.put('/me/password', data)
}

export function deleteMyAvatar() {
  return apiClient.delete('/me/avatar')
}

export function getMyStats() {
  return apiClient.get<MyStats>('/me/stats')
}

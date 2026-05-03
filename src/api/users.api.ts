import apiClient from './client'
import type { Page, PageParams } from '@/types/api'
import type { User, UserCreateRequest, UserUpdateRequest } from '@/types/user'

export function getUsers(filters?: { email?: string; role?: string; active?: boolean }, pageable?: PageParams) {
  const params: Record<string, string | boolean> = {}
  if (pageable?.page !== undefined) params.page = String(pageable.page)
  if (pageable?.size !== undefined) params.size = String(pageable.size)
  if (pageable?.sort) params.sort = pageable.sort
  if (filters?.email) params.email = filters.email
  if (filters?.role) params.role = filters.role
  if (filters?.active !== undefined) params.active = filters.active
  return apiClient.get<Page<User>>('/users', { params })
}

export function getUserById(id: number) {
  return apiClient.get<User>(`/users/${id}`)
}

export function createUser(data: UserCreateRequest) {
  return apiClient.post<User>('/users', data)
}

export function updateUser(id: number, data: UserUpdateRequest) {
  return apiClient.put<User>(`/users/${id}`, data)
}

export function deleteUser(id: number) {
  return apiClient.delete(`/users/${id}`)
}

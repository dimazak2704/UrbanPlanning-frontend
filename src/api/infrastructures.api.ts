import apiClient from './client'
import type { Page, PageParams } from '@/types/api'
import type {
  Infrastructure,
  InfrastructureCreateRequest,
  InfrastructureUpdateRequest,
  InfrastructureFilters,
} from '@/types/infrastructure'

function buildParams(filters?: InfrastructureFilters, pageable?: PageParams): Record<string, string> {
  const params: Record<string, string> = {}
  if (pageable?.page !== undefined) params.page = String(pageable.page)
  if (pageable?.size !== undefined) params.size = String(pageable.size)
  if (pageable?.sort) params.sort = pageable.sort
  if (filters?.name) params.name = filters.name
  if (filters?.type) params.type = filters.type
  if (filters?.status) params.status = filters.status
  if (filters?.projectId !== undefined) params.projectId = String(filters.projectId)
  if (filters?.districtId !== undefined) params.districtId = String(filters.districtId)
  if (filters?.cityId !== undefined) params.cityId = String(filters.cityId)
  return params
}

export function getInfrastructures(filters?: InfrastructureFilters, pageable?: PageParams) {
  return apiClient.get<Page<Infrastructure>>('/infrastructures', { params: buildParams(filters, pageable) })
}

export function getInfrastructureById(id: number) {
  return apiClient.get<Infrastructure>(`/infrastructures/${id}`)
}

export function createInfrastructure(data: InfrastructureCreateRequest) {
  return apiClient.post<Infrastructure>('/infrastructures', data)
}

export function updateInfrastructure(id: number, data: InfrastructureUpdateRequest) {
  return apiClient.put<Infrastructure>(`/infrastructures/${id}`, data)
}

export function deleteInfrastructure(id: number) {
  return apiClient.delete(`/infrastructures/${id}`)
}

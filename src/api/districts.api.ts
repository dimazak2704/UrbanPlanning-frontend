import apiClient from './client'
import type { Page, PageParams } from '@/types/api'
import type { District, DistrictCreateRequest, DistrictUpdateRequest, DistrictFilters } from '@/types/district'

function buildParams(filters?: DistrictFilters, pageable?: PageParams): Record<string, string> {
  const params: Record<string, string> = {}
  if (pageable?.page !== undefined) params.page = String(pageable.page)
  if (pageable?.size !== undefined) params.size = String(pageable.size)
  if (pageable?.sort) params.sort = pageable.sort
  if (filters?.name) params.name = filters.name
  if (filters?.cityId !== undefined) params.cityId = String(filters.cityId)
  if (filters?.type) params.type = filters.type
  return params
}

export function getDistricts(filters?: DistrictFilters, pageable?: PageParams) {
  return apiClient.get<Page<District>>('/districts', { params: buildParams(filters, pageable) })
}

export function getDistrictById(id: number) {
  return apiClient.get<District>(`/districts/${id}`)
}

export function createDistrict(data: DistrictCreateRequest) {
  return apiClient.post<District>('/districts', data)
}

export function updateDistrict(id: number, data: DistrictUpdateRequest) {
  return apiClient.put<District>(`/districts/${id}`, data)
}

export function deleteDistrict(id: number) {
  return apiClient.delete(`/districts/${id}`)
}

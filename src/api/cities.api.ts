import apiClient from './client'
import type { Page, PageParams } from '@/types/api'
import type { City, CityCreateRequest, CityUpdateRequest, CityFilters } from '@/types/city'

function buildParams(filters?: CityFilters, pageable?: PageParams): Record<string, string> {
  const params: Record<string, string> = {}
  if (pageable?.page !== undefined) params.page = String(pageable.page)
  if (pageable?.size !== undefined) params.size = String(pageable.size)
  if (pageable?.sort) params.sort = pageable.sort
  if (filters?.name) params.name = filters.name
  if (filters?.region) params.region = filters.region
  if (filters?.minPopulation !== undefined) params.minPopulation = String(filters.minPopulation)
  if (filters?.maxPopulation !== undefined) params.maxPopulation = String(filters.maxPopulation)
  return params
}

export function getCities(filters?: CityFilters, pageable?: PageParams) {
  return apiClient.get<Page<City>>('/cities', { params: buildParams(filters, pageable) })
}

export function getCityById(id: number) {
  return apiClient.get<City>(`/cities/${id}`)
}

export function createCity(data: CityCreateRequest) {
  return apiClient.post<City>('/cities', data)
}

export function updateCity(id: number, data: CityUpdateRequest) {
  return apiClient.put<City>(`/cities/${id}`, data)
}

export function deleteCity(id: number) {
  return apiClient.delete(`/cities/${id}`)
}

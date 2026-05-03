import apiClient from './client'
import type { Page, PageParams } from '@/types/api'
import type { Architect, ArchitectFilters } from '@/types/architect'

function buildParams(filters?: ArchitectFilters, pageable?: PageParams): Record<string, string> {
  const params: Record<string, string> = {}
  if (pageable?.page !== undefined) params.page = String(pageable.page)
  if (pageable?.size !== undefined) params.size = String(pageable.size)
  if (pageable?.sort) params.sort = pageable.sort
  if (filters?.fullName) params.fullName = filters.fullName
  if (filters?.specialization) params.specialization = filters.specialization
  if (filters?.minExperience !== undefined) params.minExperience = String(filters.minExperience)
  if (filters?.maxExperience !== undefined) params.maxExperience = String(filters.maxExperience)
  return params
}

export function getArchitects(filters?: ArchitectFilters, pageable?: PageParams) {
  return apiClient.get<Page<Architect>>('/architects', { params: buildParams(filters, pageable) })
}

export function getArchitectById(id: number) {
  return apiClient.get<Architect>(`/architects/${id}`)
}

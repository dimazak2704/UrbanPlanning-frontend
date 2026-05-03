import apiClient from './client'
import type { Page, PageParams } from '@/types/api'
import type { Project, ProjectCreateRequest, ProjectUpdateRequest, ProjectFilters } from '@/types/project'

function buildParams(filters?: ProjectFilters, pageable?: PageParams): Record<string, string> {
  const params: Record<string, string> = {}
  if (pageable?.page !== undefined) params.page = String(pageable.page)
  if (pageable?.size !== undefined) params.size = String(pageable.size)
  if (pageable?.sort) params.sort = pageable.sort
  if (filters?.name) params.name = filters.name
  if (filters?.cityId !== undefined) params.cityId = String(filters.cityId)
  if (filters?.districtId !== undefined) params.districtId = String(filters.districtId)
  if (filters?.architectId !== undefined) params.architectId = String(filters.architectId)
  if (filters?.status) params.status = filters.status
  if (filters?.minBudget !== undefined) params.minBudget = String(filters.minBudget)
  if (filters?.maxBudget !== undefined) params.maxBudget = String(filters.maxBudget)
  if (filters?.startDateFrom) params.startDateFrom = filters.startDateFrom
  if (filters?.startDateTo) params.startDateTo = filters.startDateTo
  return params
}

export function getProjects(filters?: ProjectFilters, pageable?: PageParams) {
  return apiClient.get<Page<Project>>('/projects', { params: buildParams(filters, pageable) })
}

export function getProjectById(id: number) {
  return apiClient.get<Project>(`/projects/${id}`)
}

export function getMyProjects(filters?: ProjectFilters, pageable?: PageParams) {
  return apiClient.get<Page<Project>>('/projects/my', { params: buildParams(filters, pageable) })
}

export function createProject(data: ProjectCreateRequest) {
  return apiClient.post<Project>('/projects', data)
}

export function updateProject(id: number, data: ProjectUpdateRequest) {
  return apiClient.put<Project>(`/projects/${id}`, data)
}

export function deleteProject(id: number) {
  return apiClient.delete(`/projects/${id}`)
}

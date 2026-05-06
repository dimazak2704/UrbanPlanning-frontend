import type { ProjectStatus } from './enums'

export interface Project {
  id: number
  name: string
  districtId: number
  districtName: string
  cityId: number
  cityName: string
  architectId: number
  architectFullName: string
  status: ProjectStatus
  startDate: string | null
  endDate: string | null
  budget: number | null
  description: string | null
  latitude: number | null
  longitude: number | null
  infrastructureCount: number
  createdAt: string
  updatedAt: string
  imageUrl: string | null
}

export interface ProjectRequest {
  name: string
  districtId: number
  architectId?: number | null
  status: ProjectStatus
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  description?: string | null
  latitude?: number | null
  longitude?: number | null
  imageUrl?: string | null
}

export type ProjectCreateRequest = ProjectRequest
export type ProjectUpdateRequest = ProjectRequest

export interface ProjectFilters {
  name?: string
  cityId?: number
  districtId?: number
  architectId?: number
  status?: ProjectStatus
  minBudget?: number
  maxBudget?: number
  startDateFrom?: string
  startDateTo?: string
}

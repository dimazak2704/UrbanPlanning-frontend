import type { ProjectStatus } from './enums'

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  budget: number
  startDate: string
  endDate: string | null
  imageUrl: string | null
  cityId: number
  cityName: string
  districtId: number
  districtName: string
  architectId: number
  architectFullName: string
  createdAt: string
  updatedAt: string
}

export interface ProjectCreateRequest {
  name: string
  description: string
  status: ProjectStatus
  budget: number
  startDate: string
  endDate?: string | null
  imageUrl?: string | null
  cityId: number
  districtId: number
}

export type ProjectUpdateRequest = ProjectCreateRequest

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

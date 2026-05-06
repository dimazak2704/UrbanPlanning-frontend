import type { InfrastructureStatus, InfrastructureType } from './enums'

export interface Infrastructure {
  id: number
  name: string
  type: InfrastructureType
  projectId: number
  projectName: string
  status: InfrastructureStatus
  constructionDate: string | null
  latitude: number | null
  longitude: number | null
  createdAt: string
  updatedAt: string
  budget: number | null
  projectArchitectId: number
  imageUrl: string | null
}

export interface InfrastructureRequest {
  name: string
  type: InfrastructureType
  projectId: number
  status: InfrastructureStatus
  constructionDate?: string | null
  latitude?: number | null
  longitude?: number | null
  budget?: number | null
  imageUrl?: string | null
}

export type InfrastructureCreateRequest = InfrastructureRequest
export type InfrastructureUpdateRequest = InfrastructureRequest

export interface InfrastructureFilters {
  name?: string
  type?: InfrastructureType
  status?: InfrastructureStatus
  projectId?: number
  districtId?: number
  cityId?: number
}

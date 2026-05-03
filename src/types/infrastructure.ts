import type { InfrastructureStatus, InfrastructureType } from './enums'

export interface Infrastructure {
  id: number
  name: string
  type: InfrastructureType
  status: InfrastructureStatus
  description: string
  cost: number
  imageUrl: string | null
  projectId: number
  projectName: string
  districtId: number
  districtName: string
  cityId: number
  cityName: string
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
}

export interface InfrastructureCreateRequest {
  name: string
  type: InfrastructureType
  status: InfrastructureStatus
  description: string
  cost: number
  imageUrl?: string | null
  projectId: number
  districtId: number
  latitude: number
  longitude: number
}

export type InfrastructureUpdateRequest = InfrastructureCreateRequest

export interface InfrastructureFilters {
  name?: string
  type?: InfrastructureType
  status?: InfrastructureStatus
  projectId?: number
  districtId?: number
  cityId?: number
}

import type { DistrictType } from './enums'

export interface District {
  id: number
  name: string
  type: DistrictType
  population: number
  area: number
  cityId: number
  cityName: string
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
}

export interface DistrictCreateRequest {
  name: string
  type: DistrictType
  population: number
  area: number
  cityId: number
  latitude: number
  longitude: number
}

export type DistrictUpdateRequest = DistrictCreateRequest

export interface DistrictFilters {
  name?: string
  cityId?: number
  type?: DistrictType
}

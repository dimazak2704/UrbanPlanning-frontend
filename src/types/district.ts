import type { DistrictType } from './enums'

export interface District {
  id: number
  name: string
  cityId: number
  cityName: string
  population: number | null
  area: number | null
  type: DistrictType
  latitude: number | null
  longitude: number | null
}

export interface DistrictRequest {
  name: string
  cityId: number
  population?: number | null
  area?: number | null
  type: DistrictType
  latitude?: number | null
  longitude?: number | null
}

export type DistrictCreateRequest = DistrictRequest
export type DistrictUpdateRequest = DistrictRequest

export interface DistrictFilters {
  name?: string
  cityId?: number
  cityName?: string
  type?: DistrictType
  minPopulation?: number
  maxPopulation?: number
  minArea?: number
  maxArea?: number
}

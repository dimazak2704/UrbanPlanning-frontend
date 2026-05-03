import type { ProjectStatus, InfrastructureType, InfrastructureStatus } from './enums'

export interface MapMarker {
  id: number
  name: string
  latitude: number
  longitude: number
}

export interface CityMarker extends MapMarker {
  population: number
  region: string
}

export interface DistrictMarker extends MapMarker {
  type: string
  cityName: string
}

export interface ProjectMarker extends MapMarker {
  status: ProjectStatus
  architectFullName: string
  budget: number
}

export interface InfrastructureMarker extends MapMarker {
  type: InfrastructureType
  status: InfrastructureStatus
  projectName: string
}

export interface MapBounds {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

export interface MapProjectFilters {
  cityId?: number
  districtId?: number
  architectId?: number
  status?: ProjectStatus
}

export interface MapInfrastructureFilters {
  cityId?: number
  projectId?: number
  type?: InfrastructureType
  status?: InfrastructureStatus
}

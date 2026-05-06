import type { ProjectStatus, InfrastructureType, InfrastructureStatus, DistrictType } from './enums'

export interface MapMarker {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
}

export interface CityMapMarker extends MapMarker {
  region: string
  population: number | null
  districtsCount: number
  projectsCount: number
}

export interface DistrictMapMarker extends MapMarker {
  cityId: number
  cityName: string
  type: DistrictType
  population: number | null
  projectsCount: number
}

export interface ProjectMapMarker extends MapMarker {
  status: ProjectStatus
  districtId: number
  districtName: string
  cityId: number
  cityName: string
  architectId: number
  architectFullName: string
  imageUrl: string | null
  budget: number | null
}

export interface InfrastructureMapMarker extends MapMarker {
  type: InfrastructureType
  status: InfrastructureStatus
  projectId: number
  projectName: string
  projectArchitectId: number
  imageUrl: string | null
  budget: number | null
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

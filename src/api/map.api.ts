import apiClient from './client'
import type {
  CityMarker,
  DistrictMarker,
  ProjectMarker,
  InfrastructureMarker,
  MapBounds,
  MapProjectFilters,
  MapInfrastructureFilters,
} from '@/types/map'

export function getMapCities() {
  return apiClient.get<CityMarker[]>('/map/cities')
}

export function getMapDistricts(cityId?: number) {
  const params: Record<string, string> = {}
  if (cityId !== undefined) params.cityId = String(cityId)
  return apiClient.get<DistrictMarker[]>('/map/districts', { params })
}

export function getMapProjects(filters?: MapProjectFilters, bounds?: MapBounds) {
  const params: Record<string, string> = {}
  if (filters?.cityId !== undefined) params.cityId = String(filters.cityId)
  if (filters?.districtId !== undefined) params.districtId = String(filters.districtId)
  if (filters?.architectId !== undefined) params.architectId = String(filters.architectId)
  if (filters?.status) params.status = filters.status
  if (bounds) {
    params.swLat = String(bounds.swLat)
    params.swLng = String(bounds.swLng)
    params.neLat = String(bounds.neLat)
    params.neLng = String(bounds.neLng)
  }
  return apiClient.get<ProjectMarker[]>('/map/projects', { params })
}

export function getMapInfrastructures(filters?: MapInfrastructureFilters, bounds?: MapBounds) {
  const params: Record<string, string> = {}
  if (filters?.cityId !== undefined) params.cityId = String(filters.cityId)
  if (filters?.projectId !== undefined) params.projectId = String(filters.projectId)
  if (filters?.type) params.type = filters.type
  if (filters?.status) params.status = filters.status
  if (bounds) {
    params.swLat = String(bounds.swLat)
    params.swLng = String(bounds.swLng)
    params.neLat = String(bounds.neLat)
    params.neLng = String(bounds.neLng)
  }
  return apiClient.get<InfrastructureMarker[]>('/map/infrastructures', { params })
}

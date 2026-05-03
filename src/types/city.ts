export interface City {
  id: number
  name: string
  region: string
  population: number
  area: number
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
}

export interface CityCreateRequest {
  name: string
  region: string
  population: number
  area: number
  latitude: number
  longitude: number
}

export type CityUpdateRequest = CityCreateRequest

export interface CityFilters {
  name?: string
  region?: string
  minPopulation?: number
  maxPopulation?: number
}

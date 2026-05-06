export interface City {
  id: number
  name: string
  region: string
  population: number | null
  area: number | null
  budget: number | null
  latitude: number | null
  longitude: number | null
}

export interface CityRequest {
  name: string
  region: string
  population?: number | null
  area?: number | null
  budget?: number | null
  latitude?: number | null
  longitude?: number | null
}

export type CityCreateRequest = CityRequest
export type CityUpdateRequest = CityRequest

export interface CityFilters {
  name?: string
  region?: string
  minPopulation?: number
  maxPopulation?: number
  minArea?: number
  maxArea?: number
  minBudget?: number
  maxBudget?: number
}

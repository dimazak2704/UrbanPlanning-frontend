export interface OverviewStats {
  totalCities: number
  totalDistricts: number
  totalProjects: number
  totalInfrastructures: number
  totalArchitects: number
  totalProjectsBudget: number
  totalCitiesBudget: number
}

export interface CountByEnum {
  label: string
  count: number
}

export interface CityProjectsStats {
  cityId: number
  cityName: string
  projectsCount: number
  totalBudget: number
}

export interface TopArchitect {
  architectId: number
  fullName: string
  specialization: string | null
  projectsCount: number
  totalBudget: number
  avatarUrl: string | null
}

export interface TimelinePoint {
  period: string
  count: number
}

export interface OverviewStats {
  totalCities: number
  totalDistricts: number
  totalProjects: number
  totalInfrastructures: number
  totalArchitects: number
  totalBudget: number
}

export interface ChartDataItem {
  label: string
  value: number
}

export interface TopArchitect {
  id: number
  fullName: string
  projectsCount: number
  totalBudget: number
}

export interface TimelinePoint {
  date: string
  count: number
}

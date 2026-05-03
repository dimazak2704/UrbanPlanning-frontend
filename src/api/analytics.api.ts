import apiClient from './client'
import type { OverviewStats, ChartDataItem, TopArchitect, TimelinePoint } from '@/types/analytics'

export function getOverview() {
  return apiClient.get<OverviewStats>('/analytics/overview')
}

export function getProjectsByStatus() {
  return apiClient.get<ChartDataItem[]>('/analytics/projects/by-status')
}

export function getProjectsByCity(limit = 5) {
  return apiClient.get<ChartDataItem[]>('/analytics/projects/by-city', { params: { limit } })
}

export function getInfrastructuresByType() {
  return apiClient.get<ChartDataItem[]>('/analytics/infrastructures/by-type')
}

export function getTopArchitects(limit = 5) {
  return apiClient.get<TopArchitect[]>('/analytics/architects/top', { params: { limit } })
}

export function getProjectsTimeline() {
  return apiClient.get<TimelinePoint[]>('/analytics/projects/timeline')
}

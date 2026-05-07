import type { Project } from '@/types/project'

function monthsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()
  const total = years * 12 + months
  return total > 0 ? total : 0
}

export function getProjectDurationMonths(project: Project): number | null {
  if (!project.startDate || !project.endDate) return null
  return monthsBetween(project.startDate, project.endDate)
}

export function normalizeMetric(value: number, max: number): number {
  if (!max || max <= 0) return 0
  return Math.round((value / max) * 100)
}

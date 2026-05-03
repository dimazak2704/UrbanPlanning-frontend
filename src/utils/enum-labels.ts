import type {
  ProjectStatus,
  InfrastructureType,
  InfrastructureStatus,
  DistrictType,
  Role,
} from '@/types/enums'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: 'Запланований',
  APPROVED: 'Затверджений',
  UNDER_CONSTRUCTION: 'Будується',
  COMPLETED: 'Завершений',
  SUSPENDED: 'Призупинений',
}

export const INFRASTRUCTURE_TYPE_LABELS: Record<InfrastructureType, string> = {
  TRANSPORT: 'Транспорт',
  SOCIAL: 'Соціальна',
  UTILITY: 'Комунальна',
  RECREATIONAL: 'Рекреаційна',
  OTHER: 'Інше',
}

export const INFRASTRUCTURE_STATUS_LABELS: Record<InfrastructureStatus, string> = {
  PLANNED: 'Запланована',
  UNDER_CONSTRUCTION: 'Будується',
  OPERATIONAL: 'Діє',
}

export const DISTRICT_TYPE_LABELS: Record<DistrictType, string> = {
  RESIDENTIAL: 'Житловий',
  INDUSTRIAL: 'Промисловий',
  RECREATIONAL: 'Рекреаційний',
  MIXED: 'Змішаний',
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Адміністратор',
  ARCHITECT: 'Архітектор',
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] ?? status
}

export function getInfrastructureTypeLabel(type: InfrastructureType): string {
  return INFRASTRUCTURE_TYPE_LABELS[type] ?? type
}

export function getInfrastructureStatusLabel(status: InfrastructureStatus): string {
  return INFRASTRUCTURE_STATUS_LABELS[status] ?? status
}

export function getDistrictTypeLabel(type: DistrictType): string {
  return DISTRICT_TYPE_LABELS[type] ?? type
}

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role
}

const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  PLANNED: 'bg-slate-100 text-slate-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  UNDER_CONSTRUCTION: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
}

const INFRASTRUCTURE_STATUS_COLORS: Record<InfrastructureStatus, string> = {
  PLANNED: 'bg-slate-100 text-slate-700',
  UNDER_CONSTRUCTION: 'bg-amber-100 text-amber-700',
  OPERATIONAL: 'bg-emerald-100 text-emerald-700',
}

const DISTRICT_TYPE_COLORS: Record<DistrictType, string> = {
  RESIDENTIAL: 'bg-blue-100 text-blue-700',
  INDUSTRIAL: 'bg-orange-100 text-orange-700',
  RECREATIONAL: 'bg-emerald-100 text-emerald-700',
  MIXED: 'bg-purple-100 text-purple-700',
}

export function getProjectStatusColor(status: ProjectStatus): string {
  return PROJECT_STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'
}

export function getInfrastructureStatusColor(status: InfrastructureStatus): string {
  return INFRASTRUCTURE_STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700'
}

export function getDistrictTypeColor(type: DistrictType): string {
  return DISTRICT_TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-700'
}

import i18n from '@/i18n'
import type {
  ProjectStatus,
  InfrastructureType,
  InfrastructureStatus,
  DistrictType,
  Role,
} from '@/types/enums'

const t = (key: string) => i18n.global.t(key)

export const PROJECT_STATUS_LABELS = new Proxy({} as Record<ProjectStatus, string>, {
  get: (_, key: string) => t(`enums.projectStatus.${key}`),
})

export const INFRASTRUCTURE_TYPE_LABELS = new Proxy({} as Record<InfrastructureType, string>, {
  get: (_, key: string) => t(`enums.infrastructureType.${key}`),
})

export const INFRASTRUCTURE_STATUS_LABELS = new Proxy({} as Record<InfrastructureStatus, string>, {
  get: (_, key: string) => t(`enums.infrastructureStatus.${key}`),
})

export const DISTRICT_TYPE_LABELS = new Proxy({} as Record<DistrictType, string>, {
  get: (_, key: string) => t(`enums.districtType.${key}`),
})

export const ROLE_LABELS = new Proxy({} as Record<Role, string>, {
  get: (_, key: string) => t(`enums.role.${key}`),
})

export function getProjectStatusLabel(status: ProjectStatus): string {
  return t(`enums.projectStatus.${status}`)
}

export function getInfrastructureTypeLabel(type: InfrastructureType): string {
  return t(`enums.infrastructureType.${type}`)
}

export function getInfrastructureStatusLabel(status: InfrastructureStatus): string {
  return t(`enums.infrastructureStatus.${status}`)
}

export function getDistrictTypeLabel(type: DistrictType): string {
  return t(`enums.districtType.${type}`)
}

export function getRoleLabel(role: Role): string {
  return t(`enums.role.${role}`)
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

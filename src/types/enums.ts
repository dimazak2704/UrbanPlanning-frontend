export type Role = 'ADMIN' | 'ARCHITECT'
export const ROLE_VALUES: Role[] = ['ADMIN', 'ARCHITECT']

export type ProjectStatus =
  | 'PLANNED'
  | 'APPROVED'
  | 'UNDER_CONSTRUCTION'
  | 'COMPLETED'
  | 'SUSPENDED'
export const PROJECT_STATUS_VALUES: ProjectStatus[] = [
  'PLANNED',
  'APPROVED',
  'UNDER_CONSTRUCTION',
  'COMPLETED',
  'SUSPENDED',
]

export type InfrastructureStatus =
  | 'PLANNED'
  | 'UNDER_CONSTRUCTION'
  | 'OPERATIONAL'
export const INFRASTRUCTURE_STATUS_VALUES: InfrastructureStatus[] = [
  'PLANNED',
  'UNDER_CONSTRUCTION',
  'OPERATIONAL',
]

export type InfrastructureType =
  | 'TRANSPORT'
  | 'SOCIAL'
  | 'UTILITY'
  | 'RECREATIONAL'
  | 'OTHER'
export const INFRASTRUCTURE_TYPE_VALUES: InfrastructureType[] = [
  'TRANSPORT',
  'SOCIAL',
  'UTILITY',
  'RECREATIONAL',
  'OTHER',
]

export type DistrictType =
  | 'RESIDENTIAL'
  | 'INDUSTRIAL'
  | 'RECREATIONAL'
  | 'MIXED'
export const DISTRICT_TYPE_VALUES: DistrictType[] = [
  'RESIDENTIAL',
  'INDUSTRIAL',
  'RECREATIONAL',
  'MIXED',
]

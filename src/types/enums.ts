export type Role = 'ADMIN' | 'ARCHITECT'

export type ProjectStatus =
  | 'PLANNED'
  | 'APPROVED'
  | 'UNDER_CONSTRUCTION'
  | 'COMPLETED'
  | 'SUSPENDED'

export type InfrastructureStatus =
  | 'PLANNED'
  | 'UNDER_CONSTRUCTION'
  | 'OPERATIONAL'

export type InfrastructureType =
  | 'TRANSPORT'
  | 'SOCIAL'
  | 'UTILITY'
  | 'RECREATIONAL'
  | 'OTHER'

export type DistrictType =
  | 'RESIDENTIAL'
  | 'INDUSTRIAL'
  | 'RECREATIONAL'
  | 'MIXED'

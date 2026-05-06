export interface Architect {
  id: number
  firstName: string
  lastName: string
  patronymic: string | null
  fullName: string
  specialization: string | null
  experienceYears: number | null
  phoneNumber: string | null
  bio: string | null
  email: string
  active: boolean
  projectsCount: number
  createdAt: string
  avatarUrl: string | null
}

export interface ArchitectFilters {
  fullName?: string
  specialization?: string
  minExperience?: number
  maxExperience?: number
}

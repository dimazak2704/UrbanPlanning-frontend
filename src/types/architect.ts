export interface Architect {
  id: number
  fullName: string
  email: string
  specialization: string
  experienceYears: number
  avatarUrl: string | null
  projectsCount: number
  createdAt: string
}

export interface ArchitectFilters {
  fullName?: string
  specialization?: string
  minExperience?: number
  maxExperience?: number
}

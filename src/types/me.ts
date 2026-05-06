import type { Role, ProjectStatus } from './enums'

export interface AuthUser {
  id: number
  email: string
  role: Role
}

export interface AuthResponse {
  token: string
  email: string
  role: Role
  userId: number
}

export interface Me {
  id: number
  email: string
  role: Role
  active: boolean
  firstName: string | null
  lastName: string | null
  patronymic: string | null
  fullName: string | null
  specialization: string | null
  experienceYears: number | null
  phoneNumber: string | null
  bio: string | null
  createdAt: string
  avatarUrl: string | null
}

export interface UpdateMeRequest {
  firstName?: string | null
  lastName?: string | null
  patronymic?: string | null
  specialization?: string | null
  experienceYears?: number | null
  phoneNumber?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface MeStats {
  totalProjects: number
  projectsByStatus: Record<ProjectStatus, number>
  totalBudget: number
  totalInfrastructures: number
}

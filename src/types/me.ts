import type { Role } from './enums'

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

export interface MyProfile {
  id: number
  email: string
  role: Role
  fullName: string
  specialization: string | null
  experienceYears: number | null
  avatarUrl: string | null
  createdAt: string
}

export interface MyProfileUpdateRequest {
  fullName: string
  specialization?: string | null
  experienceYears?: number | null
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export interface MyStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
}

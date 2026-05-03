import type { Role } from './enums'

export interface User {
  id: number
  email: string
  role: Role
  fullName: string
  specialization: string | null
  experienceYears: number | null
  avatarUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface UserCreateRequest {
  email: string
  password: string
  role: Role
  fullName: string
  specialization?: string | null
  experienceYears?: number | null
}

export interface UserUpdateRequest {
  email: string
  role: Role
  fullName: string
  specialization?: string | null
  experienceYears?: number | null
}

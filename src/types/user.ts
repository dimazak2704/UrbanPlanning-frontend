import type { Role } from './enums'

export interface User {
  id: number
  email: string
  role: Role
  active: boolean
  firstName: string | null
  lastName: string | null
  patronymic: string | null
  specialization: string | null
  experienceYears: number | null
  phoneNumber: string | null
  bio: string | null
  createdAt: string
  avatarUrl: string | null
}

export interface CreateUserRequest {
  email: string
  password: string
  role: Role
  firstName?: string | null
  lastName?: string | null
  patronymic?: string | null
  specialization?: string | null
  experienceYears?: number | null
  phoneNumber?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface UpdateUserRequest {
  email?: string
  role?: Role
  active?: boolean
  firstName?: string | null
  lastName?: string | null
  patronymic?: string | null
  specialization?: string | null
  experienceYears?: number | null
  phoneNumber?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

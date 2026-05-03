export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ErrorResponse {
  status: number
  error: string
  message: string
  timestamp: string
}

export type SortDirection = 'asc' | 'desc'

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}

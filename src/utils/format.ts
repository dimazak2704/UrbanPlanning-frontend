import { format, parseISO } from 'date-fns'
import { uk } from 'date-fns/locale'

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '₴ 0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '₴ 0'
  return `₴ ${num.toLocaleString('uk-UA', { maximumFractionDigits: 0 })}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    return format(parsed, 'dd.MM.yyyy', { locale: uk })
  } catch {
    return '—'
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    return format(parsed, 'dd.MM.yyyy HH:mm', { locale: uk })
  } catch {
    return '—'
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0'
  return value.toLocaleString('uk-UA')
}

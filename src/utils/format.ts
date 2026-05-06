import { format, parseISO } from 'date-fns'
import { uk } from 'date-fns/locale'
import { enUS } from 'date-fns/locale'
import { getCurrentLocale } from '@/i18n'
import i18n from '@/i18n'

const { t } = i18n.global as any

function getDateLocale() {
  return getCurrentLocale() === 'en' ? enUS : uk
}

function getDateFormat() {
  return getCurrentLocale() === 'en' ? 'MMMM d, yyyy' : 'dd MMMM yyyy'
}

function getDateTimeFormat() {
  return getCurrentLocale() === 'en' ? 'MMMM d, yyyy HH:mm' : 'dd MMMM yyyy HH:mm'
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '₴ 0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '₴ 0'

  const locale = getCurrentLocale()
  if (locale === 'en') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(num)
  }
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(num)
}

export function formatCompactCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '₴ 0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '₴ 0'

  const locale = getCurrentLocale()
  const prefix = locale === 'en' ? 'UAH' : '₴'
  
  if (num >= 1_000_000_000) return `${prefix} ${(num / 1_000_000_000).toFixed(1)} ${t('common.billions')}`
  if (num >= 1_000_000) return `${prefix} ${(num / 1_000_000).toFixed(1)} ${t('common.millions')}`
  if (num >= 1_000) return `${prefix} ${(num / 1_000).toFixed(1)} ${t('common.thousands')}`
  
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'uk-UA', { 
    style: 'currency', 
    currency: 'UAH', 
    maximumFractionDigits: 0 
  }).format(num)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    return format(parsed, getDateFormat(), { locale: getDateLocale() })
  } catch {
    return '—'
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date
    return format(parsed, getDateTimeFormat(), { locale: getDateLocale() })
  } catch {
    return '—'
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0'
  const locale = getCurrentLocale()
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'uk-UA').format(value)
}

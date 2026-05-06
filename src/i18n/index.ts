import { createI18n } from 'vue-i18n'
import uk from './locales/uk.json'
import en from './locales/en.json'

export type SupportedLocale = 'uk' | 'en'

const savedLocale = (localStorage.getItem('locale') as SupportedLocale) || 'uk'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'uk',
  messages: { uk, en },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export function getCurrentLocale(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale
}

export default i18n

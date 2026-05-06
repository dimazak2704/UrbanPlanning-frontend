import { helpers, required, email, minLength, minValue, maxValue } from '@vuelidate/validators'
import i18n from '@/i18n'

const { t } = i18n.global as any

export const requiredField = helpers.withMessage(() => t('validation.required'), required)
export const emailField = helpers.withMessage(() => t('validation.email'), email)

export function minLengthField(length: number) {
  return helpers.withMessage(() => t('validation.minLength', { min: length }), minLength(length))
}

export function minValueField(min: number) {
  return helpers.withMessage(() => t('validation.minValue', { min }), minValue(min))
}

export function maxValueField(max: number) {
  return helpers.withMessage(() => t('validation.maxValue', { max }), maxValue(max))
}

import { helpers, required, email, minLength, minValue, maxValue } from '@vuelidate/validators'

export const requiredField = helpers.withMessage('Це поле обовʼязкове', required)
export const emailField = helpers.withMessage('Невірний формат email', email)

export function minLengthField(length: number) {
  return helpers.withMessage(`Мінімум ${length} символів`, minLength(length))
}

export function minValueField(min: number) {
  return helpers.withMessage(`Мінімальне значення: ${min}`, minValue(min))
}

export function maxValueField(max: number) {
  return helpers.withMessage(`Максимальне значення: ${max}`, maxValue(max))
}

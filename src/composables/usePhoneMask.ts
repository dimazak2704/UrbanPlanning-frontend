import { computed, type Ref, type WritableComputedRef } from 'vue'

/**
 * Composable для маски українського номера телефону.
 * Формат відображення: +380 XX XXX XX XX
 * Зберігається в моделі як: +380XXXXXXXXX (чисті цифри з +)
 *
 * @param model — ref на поле phoneNumber (string)
 * @returns maskedPhone — computed з get/set для v-model
 */
export function usePhoneMask(model: Ref<string>): {
  maskedPhone: WritableComputedRef<string>
  formatPhone: (raw: string) => string
  unmaskPhone: (masked: string) => string
} {
  const PREFIX = '+380'

  /** Видаляє все крім цифр */
  function digitsOnly(value: string): string {
    return value.replace(/\D/g, '')
  }

  /** Форматує чисті цифри (без +380) у маску: XX XXX XX XX */
  function applyMask(digits: string): string {
    let result = ''
    // Формат: XX XXX XX XX  (максимум 9 цифр після 380)
    if (digits.length > 0) result += digits.slice(0, 2)
    if (digits.length > 2) result += ' ' + digits.slice(2, 5)
    if (digits.length > 5) result += ' ' + digits.slice(5, 7)
    if (digits.length > 7) result += ' ' + digits.slice(7, 9)
    return result
  }

  /** Форматує raw номер (+380XXXXXXXXX) у відображення +380 XX XXX XX XX */
  function formatPhone(raw: string): string {
    if (!raw) return ''
    const allDigits = digitsOnly(raw)

    // Якщо починається з 380 — прибираємо префікс для маскування
    if (allDigits.startsWith('380')) {
      const afterPrefix = allDigits.slice(3, 12)
      if (!afterPrefix) return PREFIX + ' '
      return PREFIX + ' ' + applyMask(afterPrefix)
    }

    // Якщо є якісь цифри — трактуємо як номер без 380
    if (allDigits.length > 0) {
      const afterPrefix = allDigits.slice(0, 9)
      return PREFIX + ' ' + applyMask(afterPrefix)
    }

    return ''
  }

  /** Витягує чистий номер з маски: +380XXXXXXXXX */
  function unmaskPhone(masked: string): string {
    if (!masked) return ''
    const allDigits = digitsOnly(masked)
    if (allDigits.startsWith('380')) {
      return '+' + allDigits.slice(0, 12)
    }
    if (allDigits.length > 0) {
      return '+380' + allDigits.slice(0, 9)
    }
    return ''
  }

  const maskedPhone = computed<string>({
    get() {
      return formatPhone(model.value)
    },
    set(newVal: string) {
      // Якщо користувач очистив поле
      if (!newVal || newVal === PREFIX || newVal === PREFIX + ' ') {
        model.value = ''
        return
      }
      model.value = unmaskPhone(newVal)
    },
  })

  return { maskedPhone, formatPhone, unmaskPhone }
}

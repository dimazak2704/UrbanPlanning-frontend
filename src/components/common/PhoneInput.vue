<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '+380 XX XXX XX XX',
  error: '',
  required: false,
  disabled: false,
  id: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputId = computed(() => props.id || `phone-${Math.random().toString(36).slice(2, 9)}`)

const PREFIX = '+380 '

/** Видаляє все крім цифр */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Форматує 9 цифр (після 380) у маску: XX XXX XX XX */
function applyMask(digits: string): string {
  let result = ''
  if (digits.length > 0) result += digits.slice(0, 2)
  if (digits.length > 2) result += ' ' + digits.slice(2, 5)
  if (digits.length > 5) result += ' ' + digits.slice(5, 7)
  if (digits.length > 7) result += ' ' + digits.slice(7, 9)
  return result
}

/** raw model value → display string */
function toDisplay(raw: string): string {
  if (!raw) return ''
  const allDigits = digitsOnly(raw)
  if (allDigits.startsWith('380')) {
    const after = allDigits.slice(3, 12)
    return PREFIX + applyMask(after)
  }
  if (allDigits.length > 0) {
    return PREFIX + applyMask(allDigits.slice(0, 9))
  }
  return ''
}

/** display string → raw model value (+380XXXXXXXXX) */
function toRaw(display: string): string {
  const allDigits = digitsOnly(display)
  if (allDigits.startsWith('380')) {
    const clean = allDigits.slice(0, 12)
    return clean.length > 3 ? '+' + clean : ''
  }
  if (allDigits.length > 0) {
    return '+380' + allDigits.slice(0, 9)
  }
  return ''
}

const displayValue = ref(toDisplay(props.modelValue))
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.modelValue, (newVal) => {
  const newDisplay = toDisplay(newVal)
  if (newDisplay !== displayValue.value) {
    displayValue.value = newDisplay
  }
})

function onFocus() {
  if (!displayValue.value) {
    displayValue.value = PREFIX
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.setSelectionRange(PREFIX.length, PREFIX.length)
      }
    })
  }
}

function onBlur() {
  // Якщо тільки префікс — очистити
  if (displayValue.value.trim() === '+380' || displayValue.value === PREFIX) {
    displayValue.value = ''
    emit('update:modelValue', '')
  }
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  let raw = input.value

  // Не дозволяємо видалити +380 
  const allDigits = digitsOnly(raw)
  let numberDigits: string

  if (allDigits.startsWith('380')) {
    numberDigits = allDigits.slice(3, 12)
  } else if (allDigits.startsWith('0') && allDigits.length > 1) {
    // Підтримка вводу як 0XX — обрізаємо 0
    numberDigits = allDigits.slice(1, 10)
  } else {
    // Якщо почали вводити 38 або щось інше
    if (allDigits.startsWith('38') && !allDigits.startsWith('380')) {
      numberDigits = ''
    } else if (allDigits.startsWith('3') && allDigits.length < 3) {
      numberDigits = ''
    } else if (!allDigits.startsWith('380') && !allDigits.startsWith('0')) {
      numberDigits = allDigits.slice(0, 9)
    } else {
      numberDigits = allDigits.slice(0, 9)
    }
  }

  const formatted = PREFIX + applyMask(numberDigits)
  displayValue.value = formatted

  // Оновити input value примусово (бо Vue може не перерендерити)
  nextTick(() => {
    if (inputRef.value && inputRef.value.value !== formatted) {
      inputRef.value.value = formatted
    }
  })

  const cleanValue = numberDigits.length > 0 ? '+380' + numberDigits : ''
  emit('update:modelValue', cleanValue)
}

function onKeyDown(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement
  const selStart = input.selectionStart ?? 0

  // Блокуємо видалення префікса +380 
  if ((event.key === 'Backspace' && selStart <= PREFIX.length && input.selectionEnd === selStart) ||
      (event.key === 'Delete' && selStart < PREFIX.length - 1)) {
    // Дозволяємо Backspace, але не далі префікса
    if (event.key === 'Backspace' && selStart <= PREFIX.length) {
      event.preventDefault()
    }
  }

  // Блокуємо стрілку вліво за межі префікса
  if (event.key === 'ArrowLeft' && selStart <= PREFIX.length && !event.shiftKey) {
    event.preventDefault()
  }

  // Home — переносимо на початок після префікса
  if (event.key === 'Home' && !event.shiftKey) {
    event.preventDefault()
    input.setSelectionRange(PREFIX.length, PREFIX.length)
  }
}

function onClick() {
  if (inputRef.value) {
    const pos = inputRef.value.selectionStart ?? 0
    if (pos < PREFIX.length) {
      inputRef.value.setSelectionRange(PREFIX.length, PREFIX.length)
    }
  }
}

const inputClasses = computed(() => [
  'block w-full border-b bg-transparent px-0 py-3 text-base leading-relaxed transition-colors duration-300',
  'placeholder:text-ink-subtle dark:placeholder:text-paper/45',
  'focus:outline-none',
  'disabled:opacity-60 disabled:cursor-not-allowed',
  props.error
    ? 'border-status-suspended text-status-suspended dark:text-red-300'
    : 'border-ink/20 text-ink focus:border-ink dark:border-paper/25 dark:text-paper dark:focus:border-paper',
])
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="inputId"
      class="mb-2 block text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <input
      ref="inputRef"
      :id="inputId"
      type="tel"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      maxlength="17"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @keydown="onKeyDown"
      @click="onClick"
    />
    <p
      v-if="error"
      class="mt-2 text-xs font-mono uppercase tracking-widest text-status-suspended"
    >
      {{ error }}
    </p>
  </div>
</template>

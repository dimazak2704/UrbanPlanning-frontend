<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  type: 'text',
  error: '',
  required: false,
  disabled: false,
  id: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const attrs = useAttrs()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const inputClasses = computed(() => [
  'block w-full border-b bg-transparent px-0 py-3 text-base leading-relaxed transition-colors duration-300',
  'placeholder:text-ink-subtle dark:placeholder:text-paper/45',
  'focus:outline-none',
  'disabled:opacity-60 disabled:cursor-not-allowed',
  props.error
    ? 'border-status-suspended text-status-suspended dark:text-red-300'
    : 'border-ink/20 text-ink focus:border-ink dark:border-paper/25 dark:text-paper dark:focus:border-paper',
])

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    if (target.value === '') {
      emit('update:modelValue', '')
      return
    }
    emit('update:modelValue', Number(target.value))
    return
  }
  const value = target.value
  emit('update:modelValue', value)
}

function onKeyDown(event: KeyboardEvent) {
  if (props.type !== 'number') return
  const minAttr = (attrs.min as string | number | undefined)
  if (minAttr === undefined) return
  const min = Number(minAttr)
  if (!Number.isNaN(min) && min >= 0 && event.key === '-') {
    event.preventDefault()
  }
}
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
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      v-bind="attrs"
      @keydown="onKeyDown"
      @input="onInput"
    />
    <p
      v-if="error"
      class="mt-2 text-xs font-mono uppercase tracking-widest text-status-suspended"
    >
      {{ error }}
    </p>
  </div>
</template>

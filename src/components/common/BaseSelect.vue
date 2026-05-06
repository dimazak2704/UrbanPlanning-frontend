<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { PhCaretUpDown, PhCheck } from '@phosphor-icons/vue'
import { computed } from 'vue'

interface SelectOption {
  value: string | number | boolean
  label: string
}

interface Props {
  modelValue: string | number | boolean | null
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Оберіть...',
  label: '',
  error: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | null): void
}>()

const selectedOption = computed(() =>
  props.options.find((o) => o.value === props.modelValue),
)

function onSelect(value: string | number | boolean | null) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label
      v-if="label"
      class="mb-2 block text-xs font-mono uppercase tracking-widest text-ink-muted dark:text-paper/65"
    >
      {{ label }}
    </label>
    <Listbox
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="onSelect"
    >
      <div class="relative">
        <ListboxButton
          class="relative w-full cursor-pointer border-b bg-transparent py-3 pl-0 pr-9 text-left text-base leading-relaxed transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          :class="error ? 'border-status-suspended text-status-suspended' : 'border-ink/20 text-ink hover:border-ink focus:border-ink dark:border-paper/25 dark:text-paper dark:hover:border-paper dark:focus:border-paper'"
        >
          <span
            :class="selectedOption ? '' : 'text-ink-subtle dark:text-paper/45'"
            class="block truncate"
          >
            {{ selectedOption?.label || placeholder }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center">
            <PhCaretUpDown :size="18" weight="light" class="text-ink-muted dark:text-paper/65" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-50 mt-2 max-h-72 w-full overflow-auto border border-ink/15 bg-paper-pure py-1 focus:outline-none dark:border-night-border dark:bg-night-soft"
          >
            <ListboxOption
              v-if="placeholder"
              :value="null"
              v-slot="{ active }"
              class="relative cursor-pointer select-none"
            >
              <div
                :class="[
                  active ? 'bg-paper-warm dark:bg-night-elevated' : '',
                  'px-4 py-3 text-sm text-ink-subtle dark:text-paper/45',
                ]"
              >
                {{ placeholder }}
              </div>
            </ListboxOption>
            <ListboxOption
              v-for="option in options"
              :key="String(option.value)"
              :value="option.value"
              v-slot="{ active, selected }"
              class="relative cursor-pointer select-none"
            >
              <div
                :class="[
                  active ? 'bg-paper-warm dark:bg-night-elevated' : 'text-ink dark:text-paper',
                  'flex items-center justify-between px-4 py-3 text-sm',
                ]"
              >
                <span :class="selected ? 'font-medium' : 'font-normal'" class="block truncate font-sans">
                  {{ option.label }}
                </span>
                <PhCheck
                  v-if="selected"
                  :size="16"
                  weight="light"
                  class="shrink-0 text-accent"
                />
              </div>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <p v-if="error" class="mt-2 text-xs font-mono uppercase tracking-widest text-status-suspended">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number | null
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
  (e: 'update:modelValue', value: string | number | null): void
}>()

const selectedOption = computed(() =>
  props.options.find((o) => o.value === props.modelValue),
)

function onSelect(value: string | number | null) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium text-slate-700 mb-1"
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
          class="relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50"
          :class="error ? 'border-red-300' : 'border-slate-300'"
        >
          <span
            :class="selectedOption ? 'text-slate-900' : 'text-slate-400'"
            class="block truncate"
          >
            {{ selectedOption?.label || placeholder }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-4 w-4 text-slate-400" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg focus:outline-none"
          >
            <ListboxOption
              v-if="placeholder"
              :value="null"
              v-slot="{ active }"
              class="relative cursor-pointer select-none"
            >
              <div
                :class="[
                  active ? 'bg-slate-50' : '',
                  'px-3 py-2 text-sm text-slate-400',
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
                  active ? 'bg-primary-50 text-primary-700' : 'text-slate-900',
                  'flex items-center justify-between px-3 py-2 text-sm',
                ]"
              >
                <span :class="selected ? 'font-medium' : 'font-normal'" class="block truncate">
                  {{ option.label }}
                </span>
                <CheckIcon
                  v-if="selected"
                  class="h-4 w-4 text-primary-600 shrink-0"
                />
              </div>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

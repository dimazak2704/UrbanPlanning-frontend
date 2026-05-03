<script setup lang="ts">
import BaseSelect from '@/components/common/BaseSelect.vue'

interface SortOption {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: SortOption[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <BaseSelect
    :model-value="modelValue"
    :options="options"
    placeholder="Сортування"
    @update:model-value="emit('update:modelValue', $event as string)"
  />
</template>

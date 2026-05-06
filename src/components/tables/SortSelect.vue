<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseSelect from '@/components/common/BaseSelect.vue'

const { t } = useI18n()

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
    :placeholder="t('common.sort')"
    @update:model-value="emit('update:modelValue', $event as string)"
  />
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { useI18n } from 'vue-i18n'
import { PhInfo, PhWarningCircle } from '@phosphor-icons/vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: '',
  cancelLabel: '',
  variant: 'danger',
  loading: false,
})

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}
</script>

<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :title="title"
    size="sm"
  >
    <div class="flex items-start gap-5">
      <div
        class="flex h-12 w-12 flex-shrink-0 items-center justify-center border"
        :class="{
          'border-status-suspended/40 text-status-suspended': variant === 'danger',
          'border-status-construction/40 text-status-construction': variant === 'warning',
          'border-status-approved/40 text-status-approved': variant === 'info',
        }"
      >
        <PhWarningCircle
          v-if="variant === 'danger' || variant === 'warning'"
          :size="22"
          weight="light"
          aria-hidden="true"
        />
        <PhInfo
          v-else
          :size="22"
          weight="light"
          aria-hidden="true"
        />
      </div>
      <div class="mt-1 text-base leading-relaxed text-ink-muted dark:text-paper/70">
        <p>{{ message }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="outline" @click="close" :disabled="loading">
          {{ cancelLabel || t('common.cancel') }}
        </BaseButton>
        <BaseButton
          :variant="variant === 'danger' ? 'danger' : variant === 'warning' ? 'secondary' : 'primary'"
          :loading="loading"
          @click="confirm"
        >
          {{ confirmLabel || t('common.confirm') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

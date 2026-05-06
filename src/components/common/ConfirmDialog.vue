<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';
import { useI18n } from 'vue-i18n';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';

interface Props {
  modelValue: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: '',
  cancelLabel: '',
  variant: 'danger',
  loading: false,
});

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
};
</script>

<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :title="title"
    size="sm"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        :class="{
          'bg-red-100': variant === 'danger',
          'bg-amber-100': variant === 'warning',
          'bg-blue-100': variant === 'info',
        }"
      >
        <ExclamationTriangleIcon
          v-if="variant === 'danger' || variant === 'warning'"
          class="h-6 w-6"
          :class="{
            'text-red-600': variant === 'danger',
            'text-amber-600': variant === 'warning',
          }"
          aria-hidden="true"
        />
        <InformationCircleIcon
          v-else
          class="h-6 w-6 text-blue-600"
          aria-hidden="true"
        />
      </div>
      <div class="mt-2 text-sm text-slate-500">
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

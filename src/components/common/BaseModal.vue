<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PhX } from '@phosphor-icons/vue'

interface Props {
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => {
  emit('update:modelValue', false)
}

const maxWidthClass = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
}[props.size]
</script>

<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="close" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-ink/65 dark:bg-black/70" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-4"
            enter-to="opacity-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 translate-y-3"
          >
            <DialogPanel
              :class="[
                'w-full transform overflow-hidden border border-ink/15 bg-paper-pure text-left align-middle transition-all dark:border-night-border dark:bg-night-soft',
                maxWidthClass
              ]"
            >
              <div class="flex items-center justify-between border-b border-ink/10 px-6 py-5 dark:border-night-border">
                <DialogTitle as="h3" class="text-2xl font-serif font-medium tracking-tight text-ink dark:text-paper">
                  {{ title }}
                </DialogTitle>
                <button
                  type="button"
                  class="border border-ink/20 p-2 text-ink-muted transition-colors hover:border-ink hover:text-ink focus:outline-none dark:border-paper/25 dark:text-paper/65 dark:hover:border-paper dark:hover:text-paper"
                  @click="close"
                >
                  <PhX :size="16" weight="light" aria-hidden="true" />
                </button>
              </div>

              <div class="p-6">
                <slot />
              </div>

              <div v-if="$slots.footer" class="border-t border-ink/10 bg-paper-warm px-6 py-5 dark:border-night-border dark:bg-night-elevated">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

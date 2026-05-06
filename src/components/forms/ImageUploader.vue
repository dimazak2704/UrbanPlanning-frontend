<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhTrash, PhUploadSimple } from '@phosphor-icons/vue'
import { uploadAvatar, uploadProjectImage, uploadInfrastructureImage } from '@/api/files.api'
import { useToastStore } from '@/stores/toast.store'
import { resolveMediaUrl } from '@/utils/media-url'

interface Props {
  modelValue: string | null
  endpoint: 'avatars' | 'projects' | 'infrastructures'
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()
const toast = useToastStore()
const uploading = ref(false)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

const uploadFn = {
  avatars: uploadAvatar,
  projects: uploadProjectImage,
  infrastructures: uploadInfrastructureImage,
}

const previewSrc = computed(() => resolveMediaUrl(props.modelValue))

async function handleFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Дозволено лише JPG, PNG, WebP')
    return
  }
  if (file.size > MAX_SIZE) {
    toast.error('Розмір файлу не повинен перевищувати 5 МБ')
    return
  }
  uploading.value = true
  try {
    const { data } = await uploadFn[props.endpoint](file)
    emit('update:modelValue', data.url)
    toast.success('Фото завантажено')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Помилка завантаження')
  } finally {
    uploading.value = false
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) handleFile(input.files[0])
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0])
}

function removeImage() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <div v-if="modelValue" class="relative group">
      <img :src="previewSrc || ''" alt="Preview" class="h-64 w-full border border-ink/10 object-cover dark:border-night-border" />
      <button type="button" @click="removeImage"
        class="absolute right-3 top-3 border border-status-suspended/60 bg-paper/90 p-2 text-status-suspended opacity-0 transition-opacity group-hover:opacity-100 dark:bg-night/90">
        <PhTrash :size="14" weight="light" />
      </button>
    </div>
    <div v-else
      :class="['relative cursor-pointer border-2 border-dashed p-10 text-center transition-colors', dragOver ? 'border-accent bg-accent-soft/40' : 'border-ink/20 hover:border-ink dark:border-paper/30 dark:hover:border-paper']"
      @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop"
      @click="fileInput?.click()">
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <span class="animate-pulse text-sm font-mono uppercase tracking-[0.2em] text-ink-muted dark:text-paper/65">Loading...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <div class="border border-ink/15 p-3 dark:border-paper/25">
          <PhUploadSimple :size="28" weight="light" class="text-ink-muted dark:text-paper/65" />
        </div>
        <p class="text-sm font-mono uppercase tracking-[0.16em] text-ink dark:text-paper">Перетягніть фото або натисніть</p>
        <p class="text-xs font-mono uppercase tracking-wider text-ink-muted dark:text-paper/65">JPG, PNG, WebP до 5 МБ</p>
      </div>
    </div>
  </div>
</template>

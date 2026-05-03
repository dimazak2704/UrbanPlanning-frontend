<script setup lang="ts">
import { ref } from 'vue'
import { CloudArrowUpIcon, TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { uploadAvatar, uploadProjectImage, uploadInfrastructureImage } from '@/api/files.api'
import { useToastStore } from '@/stores/toast.store'

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
      <img :src="modelValue" alt="Preview" class="h-48 w-full rounded-xl object-cover border border-slate-200" />
      <button type="button" @click="removeImage"
        class="absolute top-2 right-2 rounded-lg bg-red-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700">
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>
    <div v-else
      :class="['relative rounded-xl border-2 border-dashed transition-colors p-8 text-center cursor-pointer', dragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400']"
      @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop"
      @click="fileInput?.click()">
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-sm text-slate-500">Завантаження...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <div class="rounded-full bg-slate-100 p-3">
          <CloudArrowUpIcon class="h-8 w-8 text-slate-400" />
        </div>
        <p class="text-sm font-medium text-slate-700">Перетягніть фото або натисніть</p>
        <p class="text-xs text-slate-400">JPG, PNG, WebP до 5 МБ</p>
      </div>
    </div>
  </div>
</template>

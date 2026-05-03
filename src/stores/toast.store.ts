import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function addToast(type: Toast['type'], message: string) {
    const id = nextId++
    toasts.value.push({ id, type, message })

    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function success(message: string) {
    addToast('success', message)
  }

  function error(message: string) {
    addToast('error', message)
  }

  function info(message: string) {
    addToast('info', message)
  }

  return {
    toasts,
    removeToast,
    success,
    error,
    info,
  }
})

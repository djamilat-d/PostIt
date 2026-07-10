import { ref } from 'vue'
import { defineStore } from 'pinia'

let nextId = 1
const AUTO_DISMISS_MS = 3000

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push(message, type = 'success') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function success(message) {
    return push(message, 'success')
  }

  function error(message) {
    return push(message, 'error')
  }

  return { toasts, push, dismiss, success, error }
})

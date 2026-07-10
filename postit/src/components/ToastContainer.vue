<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="toastStore.dismiss(toast.id)"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  cursor: pointer;
  max-width: 360px;
  padding: 12px 20px;
  border-radius: 999px;
  background: #fff;
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.9em;
  box-shadow: var(--shadow-md);
  text-align: center;
}

.toast--success {
  background: linear-gradient(120deg, var(--color-primary), var(--color-primary-2));
  color: #fff;
}

.toast--error {
  background: linear-gradient(120deg, var(--color-danger), var(--color-danger-dark));
  color: #fff;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(16px);
  opacity: 0;
}
</style>

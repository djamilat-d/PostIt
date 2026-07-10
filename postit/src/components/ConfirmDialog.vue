<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="confirm-dialog__actions">
          <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Annuler</button>
          <button type="button" class="btn btn-danger" @click="$emit('confirm')">Supprimer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmer la suppression',
  },
  message: {
    type: String,
    default: 'Cette action est définitive.',
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  background: rgba(21, 14, 41, 0.55);
  backdrop-filter: blur(3px);
  animation: fadeIn 0.15s ease both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-dialog {
  width: 100%;
  max-width: 360px;
  text-align: center;
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  box-shadow: var(--shadow-md);
  animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.confirm-dialog h3 {
  margin-top: 0;
}

.confirm-dialog p {
  color: var(--color-text-muted);
  margin: 8px 0 24px;
}

.confirm-dialog__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>

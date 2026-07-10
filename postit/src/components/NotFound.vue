<template>
  <div class="page not-found">
    <AppHeader />
    <div class="not-found__card">
      <h1>Page introuvable</h1>
      <p>Ce post-it s'est envolé... ou l'url est fausse.</p>
      <router-link to="/" class="btn btn-primary">← Retour à l'accueil</router-link>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.not-found__card {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 48px 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.not-found__card p {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}
</style>

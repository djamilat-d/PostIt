<template>
  <div class="page">
    <AppHeader />

    <div class="notes-page__toolbar">
      <h1>Mes Post-it</h1>
      <button type="button" class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Fermer' : '+ Ajouter un post-it' }}
      </button>
    </div>

    <NoteModifier v-if="showForm" @submit="handleCreate" @cancel="showForm = false" />

    <p v-if="notesStore.loading" class="state-message">Chargement des notes…</p>
    <p v-else-if="notesStore.error" class="state-message state-message--error">
      {{ notesStore.error }}
    </p>
    <p v-else-if="notesStore.notes.length === 0" class="state-message">
      Aucun post-it pour le moment. Ajoute le premier !
    </p>

    <div v-else class="notes-grid">
      <NoteCard
        v-for="(note, index) in notesStore.notes"
        :key="note.id"
        :note="note"
        :index="index"
        @delete="handleDelete"
        @view="goToDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import AppHeader from '@/components/AppHeader.vue'
import NoteCard from '@/components/NoteCard.vue'
import NoteModifier from '@/components/NoteModifier.vue'

const router = useRouter()
const notesStore = useNotesStore()
const showForm = ref(false)

onMounted(() => {
  notesStore.fetchNotes()
})

async function handleCreate(payload) {
  try {
    await notesStore.createNote(payload)
    showForm.value = false
  } catch {
    // le message d'erreur est déjà dans notesStore.error, affiché plus bas
  }
}

async function handleDelete(id) {
  if (!confirm('Supprimer ce post-it ?')) return
  await notesStore.deleteNote(id)
}

function goToDetail(id) {
  router.push({ name: 'detail-note', params: { id } })
}
</script>

<style scoped>
.notes-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.notes-page__toolbar h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  color: #fff;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.5px;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
</style>

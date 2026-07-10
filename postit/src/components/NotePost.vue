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

    <input
      v-if="notesStore.notes.length > 0"
      v-model="search"
      type="search"
      class="search-input"
      placeholder="Rechercher un post-it..."
    />

    <p v-if="notesStore.loading" class="state-message">Chargement des notes…</p>
    <div v-else-if="notesStore.error" class="state-message state-message--error">
      <p>{{ notesStore.error }}</p>
      <button type="button" class="btn btn-secondary" @click="notesStore.fetchNotes()">Réessayer</button>
    </div>
    <p v-else-if="notesStore.notes.length === 0" class="state-message">
      Aucun post-it pour le moment. Ajoute le premier !
    </p>
    <p v-else-if="filteredNotes.length === 0" class="state-message">
      Aucun résultat pour « {{ search }} ».
    </p>

    <div v-else class="notes-grid">
      <NoteCard
        v-for="(note, index) in filteredNotes"
        :key="note.id"
        :note="note"
        :index="index"
        @delete="askDelete"
        @view="goToDetail"
      />
    </div>

    <ConfirmDialog
      :open="pendingDeleteId !== null"
      message="Ce post-it sera supprimé définitivement."
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import AppHeader from '@/components/AppHeader.vue'
import NoteCard from '@/components/NoteCard.vue'
import NoteModifier from '@/components/NoteModifier.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const notesStore = useNotesStore()
const showForm = ref(false)
const search = ref('')
const pendingDeleteId = ref(null)

onMounted(() => {
  notesStore.fetchNotes()
})

const filteredNotes = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return notesStore.notes
  return notesStore.notes.filter((note) => {
    const content = Array.isArray(note.content) ? note.content.join(' ') : note.content || ''
    return note.title.toLowerCase().includes(query) || content.toLowerCase().includes(query)
  })
})

async function handleCreate(payload) {
  try {
    await notesStore.createNote(payload)
    showForm.value = false
  } catch {
    // le message d'erreur est déjà dans notesStore.error, affiché plus bas
  }
}

function askDelete(id) {
  pendingDeleteId.value = id
}

async function confirmDelete() {
  const id = pendingDeleteId.value
  pendingDeleteId.value = null
  if (id !== null) await notesStore.deleteNote(id)
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

.search-input {
  display: block;
  width: 100%;
  max-width: 340px;
  margin-bottom: var(--space-4);
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  font-size: 0.95em;
}

.search-input:focus {
  outline: 2px solid var(--color-primary);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
</style>

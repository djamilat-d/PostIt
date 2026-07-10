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

    <div v-if="notesStore.loading" class="notes-grid">
      <NoteCardSkeleton v-for="n in 6" :key="n" />
    </div>
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

    <template v-else>
      <div class="notes-grid">
        <NoteCard
          v-for="(note, index) in pagedNotes"
          :key="note.id"
          :note="note"
          :index="index"
          @delete="askDelete"
          @view="goToDetail"
          @duplicate="handleDuplicate"
          @reorder="handleReorder"
        />
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button type="button" class="btn btn-secondary" :disabled="currentPage === 1" @click="currentPage--">
          ← Précédent
        </button>
        <span class="pagination__info">Page {{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Suivant →
        </button>
      </div>
    </template>

    <ConfirmDialog
      :open="pendingDeleteId !== null"
      message="Ce post-it sera supprimé définitivement."
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/AppHeader.vue'
import NoteCard from '@/components/NoteCard.vue'
import NoteCardSkeleton from '@/components/NoteCardSkeleton.vue'
import NoteModifier from '@/components/NoteModifier.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const PAGE_SIZE = 9

const router = useRouter()
const notesStore = useNotesStore()
const toastStore = useToastStore()
const showForm = ref(false)
const search = ref('')
const pendingDeleteId = ref(null)
const currentPage = ref(1)

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

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNotes.value.length / PAGE_SIZE)))

const pagedNotes = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredNotes.value.slice(start, start + PAGE_SIZE)
})

// on revient à la page 1 dès qu'on cherche autre chose, et on recale si la
// page courante n'existe plus (ex: suppression de notes)
watch(search, () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

async function handleCreate(payload) {
  try {
    await notesStore.createNote(payload)
    showForm.value = false
    toastStore.success('Post-it ajouté')
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
  if (id === null) return
  try {
    await notesStore.deleteNote(id)
    toastStore.success('Post-it supprimé')
  } catch {
    toastStore.error(notesStore.error || 'Erreur lors de la suppression')
  }
}

async function handleDuplicate(id) {
  const original = notesStore.getNoteById(id)
  if (!original) return
  try {
    await notesStore.createNote({
      title: `${original.title} (copie)`,
      content: original.content,
      color: original.color,
    })
    toastStore.success('Post-it dupliqué')
  } catch {
    toastStore.error(notesStore.error || 'Erreur lors de la duplication')
  }
}

function handleReorder({ fromId, toId }) {
  notesStore.reorderNotes(fromId, toId)
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
  color: var(--color-on-bg);
  text-shadow: var(--shadow-on-bg-text);
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.pagination__info {
  color: var(--color-on-bg);
  font-weight: 600;
  text-shadow: var(--shadow-on-bg-text);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>

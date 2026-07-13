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

    <div v-if="notesStore.notes.length > 0" class="filters">
      <input v-model="search" type="search" class="search-input" placeholder="Rechercher un post-it..." />

      <div class="color-filters" role="group" aria-label="Filtrer par couleur">
        <button
          type="button"
          class="color-chip color-chip--all"
          :class="{ 'color-chip--active': colorFilter === null }"
          @click="colorFilter = null"
        >
          Toutes
        </button>
        <button
          v-for="color in NOTE_COLORS"
          :key="color.value"
          type="button"
          class="color-chip"
          :class="{ 'color-chip--active': colorFilter === color.value }"
          :style="{ background: color.gradient }"
          :aria-label="color.label"
          :aria-pressed="colorFilter === color.value"
          @click="colorFilter = colorFilter === color.value ? null : color.value"
        ></button>
      </div>

      <select v-model="sortBy" class="sort-select" aria-label="Trier par">
        <option value="recent">Plus récentes</option>
        <option value="title">Titre (A → Z)</option>
      </select>
    </div>

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
    <p v-else-if="sortedNotes.length === 0" class="state-message">
      Aucun résultat{{ search ? ` pour « ${search} »` : '' }}.
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
        <button type="button" class="btn btn-secondary" :disabled="currentPage === 1" @click="currentPage = 1">
          « Début
        </button>
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
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          Fin »
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
import { NOTE_COLORS } from '@/constants/colors'
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
const colorFilter = ref(null)
const sortBy = ref('recent')
const pendingDeleteId = ref(null)
const currentPage = ref(1)

onMounted(() => {
  notesStore.fetchNotes()
})

const filteredNotes = computed(() => {
  let list = notesStore.notes

  if (colorFilter.value) {
    list = list.filter((note) => note.color === colorFilter.value)
  }

  const query = search.value.trim().toLowerCase()
  if (query) {
    list = list.filter((note) => {
      const content = Array.isArray(note.content) ? note.content.join(' ') : note.content || ''
      return note.title.toLowerCase().includes(query) || content.toLowerCase().includes(query)
    })
  }

  return list
})

const sortedNotes = computed(() => {
  if (sortBy.value === 'title') {
    return [...filteredNotes.value].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
  }
  // 'recent' : déjà trié par récence par le store, on ne touche à rien
  return filteredNotes.value
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedNotes.value.length / PAGE_SIZE)))

const pagedNotes = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return sortedNotes.value.slice(start, start + PAGE_SIZE)
})

// on revient à la page 1 dès que le filtre/tri/recherche change, et on
// recale si la page courante n'existe plus (ex: suppression de notes)
watch([search, colorFilter, sortBy], () => {
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

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.search-input {
  display: block;
  width: 100%;
  max-width: 340px;
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

.color-filters {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-chip {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid transparent;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.color-chip:hover {
  transform: scale(1.15);
}

.color-chip--active {
  border-color: var(--color-on-bg);
  transform: scale(1.15);
}

.color-chip--all {
  width: auto;
  height: auto;
  border-radius: 999px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-text);
  font-weight: 700;
  font-size: 0.8em;
}

.color-chip--all.color-chip--active {
  background: var(--color-primary);
  color: #fff;
}

.sort-select {
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  font-size: 0.85em;
  font-weight: 600;
  color: var(--color-text);
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

<template>
  <div class="page">
    <AppHeader />

    <button type="button" class="btn btn-secondary" @click="router.push('/')">← Retour</button>

    <div v-if="loading" class="postit-detail postit-detail-skeleton" aria-hidden="true">
      <div class="postit-skeleton__line postit-skeleton__line--title"></div>
      <div class="postit-skeleton__line"></div>
      <div class="postit-skeleton__line postit-skeleton__line--short"></div>
    </div>
    <div v-else-if="error" class="state-message state-message--error">
      <p>{{ error }}</p>
      <button type="button" class="btn btn-secondary" @click="retry">Réessayer</button>
    </div>

    <template v-else-if="note">
      <NoteModifier v-if="isEditing" :note="note" @submit="handleUpdate" @cancel="isEditing = false" />

      <article v-else class="postit-detail" :class="`postit-detail--${note.color}`">
        <span class="postit-detail__tape"></span>
        <h2>{{ note.title }}</h2>
        <hr />
        <p class="postit-detail__content">
          {{ Array.isArray(note.content) ? note.content.join('\n') : note.content }}
        </p>
        <div class="postit-detail__actions">
          <button type="button" class="btn btn-danger" @click="pendingDelete = true">Supprimer</button>
          <button type="button" class="btn btn-secondary" @click="handleDuplicate">Dupliquer</button>
          <button type="button" class="btn btn-primary" @click="isEditing = true">Modifier</button>
        </div>
      </article>
    </template>

    <div v-else class="state-message">
      <p>Cette note est introuvable.</p>
      <button type="button" class="btn btn-secondary" @click="router.push('/')">Retour à l'accueil</button>
    </div>

    <ConfirmDialog
      :open="pendingDelete"
      message="Ce post-it sera supprimé définitivement."
      @confirm="handleDelete"
      @cancel="pendingDelete = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { useToastStore } from '@/stores/toast'
import AppHeader from '@/components/AppHeader.vue'
import NoteModifier from '@/components/NoteModifier.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const notesStore = useNotesStore()
const toastStore = useToastStore()
const isEditing = ref(false)
const loading = ref(false)
const error = ref(null)
const pendingDelete = ref(false)

const note = computed(() => notesStore.getNoteById(props.id))

async function loadNote() {
  // si on arrive directement sur /note/:id (refresh de la page par ex),
  // le store est vide donc on va chercher juste cette note
  if (note.value) return
  loading.value = true
  error.value = null
  const fetched = await notesStore.fetchNote(props.id)
  error.value = fetched ? null : notesStore.error
  loading.value = false
}

onMounted(loadNote)

function retry() {
  loadNote()
}

async function handleUpdate(payload) {
  try {
    await notesStore.updateNote(props.id, payload)
    isEditing.value = false
    toastStore.success('Post-it modifié')
  } catch {
    // erreur déjà stockée dans notesStore.error
  }
}

async function handleDelete() {
  pendingDelete.value = false
  try {
    await notesStore.deleteNote(props.id)
    toastStore.success('Post-it supprimé')
    router.push('/')
  } catch {
    toastStore.error(notesStore.error || 'Erreur lors de la suppression')
  }
}

async function handleDuplicate() {
  if (!note.value) return
  try {
    const created = await notesStore.createNote({
      title: `${note.value.title} (copie)`,
      content: note.value.content,
      color: note.value.color,
    })
    toastStore.success('Post-it dupliqué')
    router.push({ name: 'detail-note', params: { id: created.id } })
  } catch {
    toastStore.error(notesStore.error || 'Erreur lors de la duplication')
  }
}
</script>

<style scoped>
.postit-detail {
  position: relative;
  margin-top: var(--space-4);
  max-width: 520px;
  padding: 36px var(--space-4) var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transform: rotate(-1deg);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.postit-detail-skeleton {
  background: rgba(255, 255, 255, 0.5);
}

.postit-skeleton__line {
  height: 14px;
  border-radius: 999px;
  margin-bottom: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 25%, rgba(255, 255, 255, 0.85) 37%, rgba(255, 255, 255, 0.5) 63%);
  background-size: 400% 100%;
  animation: skeletonShimmer 1.4s ease infinite;
}

.postit-skeleton__line--title {
  height: 24px;
  width: 50%;
  margin-bottom: 20px;
}

.postit-skeleton__line--short {
  width: 35%;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.postit-detail__tape {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 84px;
  height: 26px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.postit-detail h2 {
  font-family: var(--font-display);
}

.postit-detail hr {
  border: none;
  border-top: 2px dashed rgba(32, 21, 56, 0.2);
}

.postit-detail--orange {
  background: linear-gradient(160deg, var(--postit-orange-a), var(--postit-orange-b));
}
.postit-detail--yellow {
  background: linear-gradient(160deg, var(--postit-yellow-a), var(--postit-yellow-b));
}
.postit-detail--green {
  background: linear-gradient(160deg, var(--postit-green-a), var(--postit-green-b));
}
.postit-detail--blue {
  background: linear-gradient(160deg, var(--postit-blue-a), var(--postit-blue-b));
}
.postit-detail--pink {
  background: linear-gradient(160deg, var(--postit-pink-a), var(--postit-pink-b));
}

.postit-detail__content {
  white-space: pre-line;
  word-break: break-word;
  color: #201538;
  font-family: var(--font-hand);
  font-size: 1.15em;
  line-height: 1.5;
}

.postit-detail__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
</style>

<template>
  <form class="note-form" @submit.prevent="handleSubmit">
    <h3>{{ isEdit ? 'Modifier le post-it' : 'Nouveau post-it' }}</h3>

    <label for="note-title">Titre :</label>
    <input
      id="note-title"
      v-model.trim="form.title"
      required
      :maxlength="TITLE_MAX_LENGTH"
      placeholder="Titre de la note"
    />
    <p class="char-count">{{ form.title.length }}/{{ TITLE_MAX_LENGTH }}</p>

    <label for="note-content">Contenu :</label>
    <textarea
      id="note-content"
      v-model.trim="form.content"
      required
      :maxlength="CONTENT_MAX_LENGTH"
      placeholder="Contenu..."
    ></textarea>
    <p class="char-count">{{ form.content.length }}/{{ CONTENT_MAX_LENGTH }}</p>

    <label id="note-color-label">Couleur :</label>
    <div class="color-picker" role="radiogroup" aria-labelledby="note-color-label">
      <button
        v-for="color in COLORS"
        :key="color.value"
        type="button"
        class="color-swatch"
        :class="{ 'color-swatch--active': form.color === color.value }"
        :style="{ background: color.gradient }"
        :aria-label="color.label"
        role="radio"
        :aria-checked="form.color === color.value"
        @click="form.color = color.value"
      ></button>
    </div>

    <div class="note-form__actions">
      <button type="submit" class="btn btn-primary btn-block">
        {{ isEdit ? 'Enregistrer' : 'Ajouter' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="handleCancel">Annuler</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch, nextTick } from 'vue'
import { NOTE_COLORS } from '@/constants/colors'

const props = defineProps({
  note: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.note)

const TITLE_MAX_LENGTH = 60
const CONTENT_MAX_LENGTH = 500

const COLORS = NOTE_COLORS

// Le brouillon d'une nouvelle note (pas d'une édition) est gardé en
// localStorage pour pas le perdre si on quitte la page par accident avant
// d'avoir cliqué sur "Ajouter".
const DRAFT_STORAGE_KEY = 'postit_draft'

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY))
  } catch {
    return null
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form))
}

function clearDraft() {
  localStorage.removeItem(DRAFT_STORAGE_KEY)
}

const form = reactive({
  title: '',
  content: '',
  color: 'orange',
})

function fillFromNote(note) {
  if (!note) {
    const draft = loadDraft()
    form.title = (draft?.title || '').slice(0, TITLE_MAX_LENGTH)
    form.content = (draft?.content || '').slice(0, CONTENT_MAX_LENGTH)
    form.color = draft?.color || 'orange'
    return
  }
  const rawContent = Array.isArray(note.content) ? note.content.join('\n') : note.content || ''
  form.title = (note.title || '').slice(0, TITLE_MAX_LENGTH)
  form.content = rawContent.slice(0, CONTENT_MAX_LENGTH)
  form.color = note.color || 'orange'
}

watch(() => props.note, fillFromNote, { immediate: true })

// on sauvegarde à chaque frappe, mais seulement en mode création
watch(
  () => [form.title, form.content, form.color],
  () => {
    if (!isEdit.value) saveDraft()
  },
)

function handleSubmit() {
  emit('submit', {
    title: form.title,
    content: [form.content],
    color: form.color,
  })
  if (!isEdit.value) {
    form.title = ''
    form.content = ''
    form.color = 'orange'
    // le watcher ci-dessus va re-sauvegarder un brouillon (vide) suite au
    // reset des champs, donc on efface pour de vrai une fois que ça s'est
    // calmé
    nextTick(clearDraft)
  }
}

function handleCancel() {
  if (!isEdit.value) clearDraft()
  emit('cancel')
}
</script>

<style scoped>
.note-form {
  max-width: 440px;
  margin: 0 auto 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  text-align: left;
  padding: 32px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.note-form h3 {
  margin-top: 0;
  font-size: 1.4em;
  background: linear-gradient(120deg, var(--color-primary), var(--color-primary-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.note-form label {
  color: var(--color-text-muted);
  display: inline-block;
  margin: 16px 0 8px;
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.note-form input,
.note-form textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 4px;
  border: none;
  border-bottom: 2px solid #eee0f2;
  color: #201538;
  font-family: inherit;
  font-size: 1em;
  transition: border-color 0.15s ease;
}

.note-form input:focus,
.note-form textarea:focus {
  outline: none;
  border-bottom-color: var(--color-primary);
}

.note-form textarea {
  min-height: 90px;
  resize: vertical;
}

.char-count {
  margin: 4px 0 0;
  text-align: right;
  font-size: 0.75em;
  color: var(--color-text-muted);
}

.color-picker {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.15s ease;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch--active {
  border-color: var(--color-text);
  transform: scale(1.2);
}

.note-form__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}
</style>

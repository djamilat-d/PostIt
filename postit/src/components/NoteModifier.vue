<template>
  <form class="note-form" @submit.prevent="handleSubmit">
    <h3>{{ isEdit ? 'Modifier le post-it' : 'Nouveau post-it' }}</h3>

    <label for="note-title">Titre :</label>
    <input id="note-title" v-model.trim="form.title" required placeholder="Titre de la note" />

    <label for="note-content">Contenu :</label>
    <textarea id="note-content" v-model.trim="form.content" required placeholder="Contenu..."></textarea>

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
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Annuler</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.note)

const COLORS = [
  { value: 'orange', label: 'Orange', gradient: 'linear-gradient(150deg, var(--postit-orange-a), var(--postit-orange-b))' },
  { value: 'yellow', label: 'Jaune', gradient: 'linear-gradient(150deg, var(--postit-yellow-a), var(--postit-yellow-b))' },
  { value: 'green', label: 'Vert', gradient: 'linear-gradient(150deg, var(--postit-green-a), var(--postit-green-b))' },
  { value: 'blue', label: 'Bleu', gradient: 'linear-gradient(150deg, var(--postit-blue-a), var(--postit-blue-b))' },
  { value: 'pink', label: 'Rose', gradient: 'linear-gradient(150deg, var(--postit-pink-a), var(--postit-pink-b))' },
]

const form = reactive({
  title: '',
  content: '',
  color: 'orange',
})

function fillFromNote(note) {
  if (!note) {
    form.title = ''
    form.content = ''
    form.color = 'orange'
    return
  }
  form.title = note.title || ''
  form.content = Array.isArray(note.content) ? note.content.join('\n') : note.content || ''
  form.color = note.color || 'orange'
}

watch(() => props.note, fillFromNote, { immediate: true })

function handleSubmit() {
  emit('submit', {
    title: form.title,
    content: [form.content],
    color: form.color,
  })
  if (!isEdit.value) {
    fillFromNote(null)
  }
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

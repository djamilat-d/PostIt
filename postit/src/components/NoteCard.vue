<template>
  <article
    class="postit-card"
    :class="[`postit-card--${note.color}`, { 'postit-card--dragging': isDragging }]"
    :style="cardStyle"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="isDragging = false"
    @dragover.prevent
    @drop="onDrop"
  >
    <span class="postit-card__tape"></span>
    <h4 class="postit-card__title">{{ note.title }}</h4>
    <p class="postit-card__excerpt">{{ excerpt }}</p>
    <div class="postit-card__actions">
      <button type="button" class="btn btn-danger btn-sm" @click="$emit('delete', note.id)">
        Supprimer
      </button>
      <button type="button" class="btn btn-secondary btn-sm" @click="$emit('duplicate', note.id)">
        Dupliquer
      </button>
      <button type="button" class="btn btn-secondary btn-sm" @click="$emit('view', note.id)">
        Voir plus →
      </button>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['delete', 'view', 'duplicate', 'reorder'])

const isDragging = ref(false)

// drag & drop natif (HTML5) pour réordonner la liste à la main. Le
// composant se contente de transporter les deux ids concernés, la logique
// de tri vit dans le store (voir reorderNotes).
function onDragStart(event) {
  isDragging.value = true
  event.dataTransfer.setData('text/plain', String(props.note.id))
  event.dataTransfer.effectAllowed = 'move'
}

function onDrop(event) {
  const fromId = event.dataTransfer.getData('text/plain')
  if (fromId && fromId !== String(props.note.id)) {
    emit('reorder', { fromId, toId: props.note.id })
  }
}

const GRADIENTS = {
  orange: 'linear-gradient(150deg, var(--postit-orange-a), var(--postit-orange-b))',
  yellow: 'linear-gradient(150deg, var(--postit-yellow-a), var(--postit-yellow-b))',
  green: 'linear-gradient(150deg, var(--postit-green-a), var(--postit-green-b))',
  blue: 'linear-gradient(150deg, var(--postit-blue-a), var(--postit-blue-b))',
  pink: 'linear-gradient(150deg, var(--postit-pink-a), var(--postit-pink-b))',
}

const cardStyle = computed(() => ({
  background: GRADIENTS[props.note.color] || GRADIENTS.yellow,
  animationDelay: `${Math.min(props.index, 12) * 60}ms`,
}))

const excerpt = computed(() => {
  const text = Array.isArray(props.note.content) ? props.note.content.join(' ') : props.note.content || ''
  const MAX_LENGTH = 80
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text
})
</script>

<style scoped>
.postit-card {
  position: relative;
  border-radius: var(--radius-md);
  padding: 22px 18px 18px;
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
  transform: rotate(-2deg);
  cursor: grab;
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    opacity 0.15s ease;
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.postit-card:nth-child(even) {
  transform: rotate(2deg);
}

.postit-card:nth-child(3n) {
  transform: rotate(-1deg);
}

.postit-card:hover {
  transform: rotate(0deg) scale(1.06) translateY(-6px);
  box-shadow: var(--shadow-glow);
  z-index: 2;
}

.postit-card--dragging {
  opacity: 0.4;
}

.postit-card__tape {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 64px;
  height: 22px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.postit-card__title {
  margin: 4px 0 8px;
  color: #201538;
  font-family: var(--font-display);
  font-weight: 800;
  word-break: break-word;
}

.postit-card__excerpt {
  margin: 0;
  flex: 1;
  color: #2c2140;
  font-family: var(--font-hand);
  font-size: 1.05em;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-line;
}

.postit-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 0.8em;
}
</style>

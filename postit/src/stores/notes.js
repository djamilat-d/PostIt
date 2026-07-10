import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as notesApi from '@/api/notes'

// L'API ne sauvegarde pas la couleur du post-it, du coup on la garde à part
// dans le localStorage (par id de note) pour pas la perdre au refresh. Le
// titre et le contenu, eux, viennent toujours de l'API.
const COLORS_STORAGE_KEY = 'postit_colors'

function loadColors() {
  try {
    return JSON.parse(localStorage.getItem(COLORS_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveColor(id, color) {
  const colors = loadColors()
  colors[id] = color
  localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colors))
}

function applyStoredColor(note) {
  if (!note) return note
  const colors = loadColors()
  return { ...note, color: colors[note.id] || note.color || 'yellow' }
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchNotes() {
    loading.value = true
    error.value = null
    try {
      const rawNotes = await notesApi.getNotes()
      notes.value = rawNotes.map(applyStoredColor)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function getNoteById(id) {
    return notes.value.find((note) => String(note.id) === String(id))
  }

  async function fetchNote(id) {
    loading.value = true
    error.value = null
    try {
      const note = applyStoredColor(await notesApi.getNote(id))
      const index = notes.value.findIndex((n) => String(n.id) === String(id))
      if (index === -1) {
        notes.value.push(note)
      } else {
        notes.value[index] = note
      }
      return note
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function createNote(payload) {
    error.value = null
    try {
      const note = await notesApi.createNote(payload)
      if (payload.color) saveColor(note.id, payload.color)
      notes.value.push(applyStoredColor(note))
      return note
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateNote(id, payload) {
    error.value = null
    try {
      const note = await notesApi.updateNote(id, payload)
      if (payload.color) saveColor(id, payload.color)
      const index = notes.value.findIndex((n) => String(n.id) === String(id))
      const merged = applyStoredColor(note)
      if (index === -1) {
        notes.value.push(merged)
      } else {
        notes.value[index] = merged
      }
      return merged
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deleteNote(id) {
    error.value = null
    try {
      await notesApi.deleteNote(id)
      notes.value = notes.value.filter((note) => String(note.id) !== String(id))
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    notes,
    loading,
    error,
    fetchNotes,
    fetchNote,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
  }
})

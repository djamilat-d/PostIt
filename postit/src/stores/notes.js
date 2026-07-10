import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as notesApi from '@/api/notes'

// L'API ne sauvegarde ni la couleur ni une date de création, du coup on
// garde ces deux trucs à part dans le localStorage (par id de note) pour
// pas les perdre au refresh. Le titre et le contenu, eux, viennent
// toujours de l'API.
const COLORS_STORAGE_KEY = 'postit_colors'
const CREATED_STORAGE_KEY = 'postit_created'
const ORDER_STORAGE_KEY = 'postit_order'

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

function loadCreated() {
  try {
    return JSON.parse(localStorage.getItem(CREATED_STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveCreated(id, timestamp) {
  const created = loadCreated()
  created[id] = timestamp
  localStorage.setItem(CREATED_STORAGE_KEY, JSON.stringify(created))
}

// la première fois qu'on croise une note, on lui donne une date de
// "découverte" qui sert de proxy pour trier par récence (l'api n'a pas de
// created_at)
function getOrAssignCreated(id) {
  const created = loadCreated()
  if (created[id]) return created[id]
  const timestamp = Date.now()
  saveCreated(id, timestamp)
  return timestamp
}

function applyStoredMeta(note) {
  if (!note) return note
  const colors = loadColors()
  return {
    ...note,
    color: colors[note.id] || note.color || 'yellow',
    createdAt: getOrAssignCreated(note.id),
  }
}

function sortByRecency(list) {
  return [...list].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

// si l'utilisateur a glissé-déposé des notes pour les réordonner à la
// main, cet ordre prend le dessus sur le tri par récence. Les notes pas
// encore dans l'ordre sauvegardé (nouvelles notes) gardent leur position
// relative telle que triée par récence, à la suite des autres.
function loadOrder() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveOrder(ids) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(ids))
}

function applyStoredOrder(list) {
  const order = loadOrder()
  if (order.length === 0) return list
  const rank = (id) => {
    const i = order.findIndex((oid) => String(oid) === String(id))
    return i === -1 ? Infinity : i
  }
  return [...list].sort((a, b) => rank(a.id) - rank(b.id))
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
      notes.value = applyStoredOrder(sortByRecency(rawNotes.map(applyStoredMeta)))
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
      const note = applyStoredMeta(await notesApi.getNote(id))
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
      saveCreated(note.id, Date.now())
      notes.value = applyStoredOrder(sortByRecency([...notes.value, applyStoredMeta(note)]))
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
      const merged = applyStoredMeta(note)
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

  // réordonnancement manuel (drag & drop) : on déplace fromId juste à côté
  // de toId dans la liste, et on retient cet ordre pour la prochaine fois
  function reorderNotes(fromId, toId) {
    const list = [...notes.value]
    const fromIndex = list.findIndex((note) => String(note.id) === String(fromId))
    const toIndex = list.findIndex((note) => String(note.id) === String(toId))
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    notes.value = list
    saveOrder(list.map((note) => note.id))
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
    reorderNotes,
  }
})

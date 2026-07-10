// Toutes les requêtes vers l'API passent par ce fichier, comme ça le reste
// de l'appli n'a jamais à connaître les routes ou le format brut renvoyé
// par le serveur.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://postit.zoul.dev'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Récupère le JSON d'une réponse fetch et balance une erreur lisible si ça a foiré
async function parseResponse(response) {
  let data = null
  try {
    data = await response.json()
  } catch {
    // pas de body JSON (204, erreur html, etc), tant pis
  }

  if (!response.ok) {
    const message = data?.error?.message || `Erreur ${response.status}`
    throw new Error(message)
  }

  return data
}

// Le back ne renvoie pas toujours exactement le même format (id/_id/note_id
// selon les routes), donc on remet tout au même format ici une bonne fois
// pour toutes: { id, title, content: string[], color }
function normalizeNote(rawNote) {
  if (!rawNote) return null
  const id = rawNote.id ?? rawNote._id ?? rawNote.note_id
  const content = Array.isArray(rawNote.content) ? rawNote.content : [rawNote.content ?? '']
  return {
    id,
    title: rawNote.title ?? '',
    content,
    color: rawNote.color ?? 'yellow',
  }
}

export async function getNotes() {
  const response = await fetch(`${API_BASE_URL}/notes`, { headers: JSON_HEADERS })
  const data = await parseResponse(response)
  const rawNotes = data?.notes ?? data ?? []
  return rawNotes.map(normalizeNote)
}

export async function getNote(id) {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, { headers: JSON_HEADERS })
  const data = await parseResponse(response)
  return normalizeNote(data?.note ?? data)
}

export async function createNote({ title, content, color }) {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ title, content }),
  })
  const data = await parseResponse(response)
  const id = data?.note_id ?? data?.id
  return normalizeNote({ id, title, content, color })
}

export async function updateNote(id, { title, content, color }) {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ title, content }),
  })
  const data = await parseResponse(response)
  const noteId = data?.note_id ?? id
  return normalizeNote({ id: noteId, title, content, color })
}

export async function deleteNote(id) {
  const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: JSON_HEADERS,
  })
  await parseResponse(response)
  return true
}

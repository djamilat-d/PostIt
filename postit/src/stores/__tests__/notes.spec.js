import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from '../notes'
import * as notesApi from '@/api/notes'

vi.mock('@/api/notes')

const sampleNote = { id: '1', title: 'Courses', content: ['Lait', 'Pain'], color: 'yellow' }

describe('notes store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('starts empty', () => {
    const store = useNotesStore()
    expect(store.notes).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('fetchNotes loads notes from the API', async () => {
    notesApi.getNotes.mockResolvedValue([sampleNote])
    const store = useNotesStore()

    await store.fetchNotes()

    expect(notesApi.getNotes).toHaveBeenCalledOnce()
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].title).toBe('Courses')
    expect(store.loading).toBe(false)
  })

  it('fetchNotes stores a readable error on failure', async () => {
    notesApi.getNotes.mockRejectedValue(new Error('Erreur 500'))
    const store = useNotesStore()

    await store.fetchNotes()

    expect(store.error).toBe('Erreur 500')
    expect(store.notes).toEqual([])
  })

  it('getNoteById finds a note regardless of id type (string vs number)', async () => {
    notesApi.getNotes.mockResolvedValue([sampleNote])
    const store = useNotesStore()
    await store.fetchNotes()

    expect(store.getNoteById(1)).toMatchObject({ id: '1' })
    expect(store.getNoteById('1')).toMatchObject({ id: '1' })
    expect(store.getNoteById('nope')).toBeUndefined()
  })

  it('createNote appends the new note returned by the API', async () => {
    notesApi.createNote.mockResolvedValue({ id: '2', title: 'New', content: ['x'], color: 'blue' })
    const store = useNotesStore()

    const created = await store.createNote({ title: 'New', content: ['x'], color: 'blue' })

    expect(created.id).toBe('2')
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].title).toBe('New')
  })

  it('updateNote replaces the matching note in place', async () => {
    notesApi.getNotes.mockResolvedValue([sampleNote])
    notesApi.updateNote.mockResolvedValue({ id: '1', title: 'Courses (updated)', content: ['Lait'], color: 'green' })
    const store = useNotesStore()
    await store.fetchNotes()

    await store.updateNote('1', { title: 'Courses (updated)', content: ['Lait'], color: 'green' })

    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].title).toBe('Courses (updated)')
  })

  it('deleteNote removes the note from the list', async () => {
    notesApi.getNotes.mockResolvedValue([sampleNote])
    notesApi.deleteNote.mockResolvedValue(true)
    const store = useNotesStore()
    await store.fetchNotes()

    await store.deleteNote('1')

    expect(store.notes).toEqual([])
  })

  it('deleteNote sets an error and keeps the note when the API call fails', async () => {
    notesApi.getNotes.mockResolvedValue([sampleNote])
    notesApi.deleteNote.mockRejectedValue(new Error('Ressource not found'))
    const store = useNotesStore()
    await store.fetchNotes()

    await expect(store.deleteNote('1')).rejects.toThrow('Ressource not found')
    expect(store.notes).toHaveLength(1)
  })

  it('reorderNotes déplace une note à côté d\'une autre et retient cet ordre', async () => {
    // on fixe un ordre de départ connu (sinon le tri par récence, basé sur
    // Date.now(), rendrait l'ordre initial non-déterministe dans le test)
    localStorage.setItem('postit_order', JSON.stringify(['1', '2', '3']))
    const notes = [
      { id: '1', title: 'A', content: [''], color: 'yellow' },
      { id: '2', title: 'B', content: [''], color: 'yellow' },
      { id: '3', title: 'C', content: [''], color: 'yellow' },
    ]
    notesApi.getNotes.mockResolvedValue(notes)
    const store = useNotesStore()
    await store.fetchNotes()
    expect(store.notes.map((n) => n.id)).toEqual(['1', '2', '3'])

    store.reorderNotes('1', '3') // A rejoint C : elle passe juste après elle

    expect(store.notes.map((n) => n.id)).toEqual(['2', '3', '1'])
    expect(JSON.parse(localStorage.getItem('postit_order'))).toEqual(['2', '3', '1'])
  })

  it('respecte un ordre manuel déjà sauvegardé au prochain fetchNotes', async () => {
    localStorage.setItem('postit_order', JSON.stringify(['3', '1', '2']))
    notesApi.getNotes.mockResolvedValue([
      { id: '1', title: 'A', content: [''], color: 'yellow' },
      { id: '2', title: 'B', content: [''], color: 'yellow' },
      { id: '3', title: 'C', content: [''], color: 'yellow' },
    ])
    const store = useNotesStore()

    await store.fetchNotes()

    expect(store.notes.map((n) => n.id)).toEqual(['3', '1', '2'])
  })
})

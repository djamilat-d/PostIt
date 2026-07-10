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
})

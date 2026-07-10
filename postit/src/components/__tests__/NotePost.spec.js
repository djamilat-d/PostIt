import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotePost from '../NotePost.vue'
import * as notesApi from '@/api/notes'

vi.mock('@/api/notes')

const notes = [
  { id: '1', title: 'Courses', content: ['Lait'], color: 'yellow' },
  { id: '2', title: 'Sport', content: ['Aller courir'], color: 'blue' },
]

async function mountNotePost() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: NotePost },
      { path: '/note/:id', name: 'detail-note', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  await router.isReady()
  const wrapper = mount(NotePost, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('NotePost', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('affiche la liste des notes récupérées', async () => {
    notesApi.getNotes.mockResolvedValue(notes)
    const { wrapper } = await mountNotePost()

    expect(wrapper.text()).toContain('Courses')
    expect(wrapper.text()).toContain('Sport')
  })

  it("affiche un message quand il n'y a aucune note", async () => {
    notesApi.getNotes.mockResolvedValue([])
    const { wrapper } = await mountNotePost()

    expect(wrapper.text()).toContain('Aucun post-it pour le moment')
  })

  it('filtre les notes avec la barre de recherche', async () => {
    notesApi.getNotes.mockResolvedValue(notes)
    const { wrapper } = await mountNotePost()

    await wrapper.find('.search-input').setValue('sport')

    expect(wrapper.text()).toContain('Sport')
    expect(wrapper.text()).not.toContain('Courses')
  })

  it('affiche le message d\'erreur avec un bouton "Réessayer"', async () => {
    notesApi.getNotes.mockRejectedValue(new Error('Erreur 500'))
    const { wrapper } = await mountNotePost()

    expect(wrapper.text()).toContain('Erreur 500')
    expect(wrapper.find('.state-message--error button').exists()).toBe(true)
  })

  it('demande confirmation avant de supprimer une note', async () => {
    notesApi.getNotes.mockResolvedValue(notes)
    notesApi.deleteNote.mockResolvedValue(true)
    const { wrapper } = await mountNotePost()

    await wrapper.findAll('.btn-danger')[0].trigger('click')
    await flushPromises()

    // la modale est téléportée dans document.body
    const dialog = document.body.querySelector('.confirm-dialog')
    expect(dialog).toBeTruthy()
    expect(notesApi.deleteNote).not.toHaveBeenCalled()

    dialog.querySelector('.btn-danger').dispatchEvent(new Event('click', { bubbles: true }))
    await flushPromises()

    expect(notesApi.deleteNote).toHaveBeenCalledWith('1')
  })
})

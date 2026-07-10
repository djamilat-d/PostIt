import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import NoteDetail from '../NoteDetail.vue'
import * as notesApi from '@/api/notes'

vi.mock('@/api/notes')

async function mountNoteDetail(id = '1') {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
  })
  router.push('/')
  await router.isReady()
  const wrapper = mount(NoteDetail, { props: { id }, global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('NoteDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('va chercher la note via l\'api quand le store est vide (arrivée directe sur /note/:id)', async () => {
    notesApi.getNote.mockResolvedValue({ id: '1', title: 'Courses', content: ['Lait'], color: 'green' })

    const { wrapper } = await mountNoteDetail('1')

    expect(notesApi.getNote).toHaveBeenCalledWith('1')
    expect(wrapper.text()).toContain('Courses')
  })

  it("affiche l'erreur avec un bouton réessayer si la note ne charge pas", async () => {
    notesApi.getNote.mockRejectedValue(new Error('Ressource not found'))

    const { wrapper } = await mountNoteDetail('999')

    expect(wrapper.text()).toContain('Ressource not found')
    expect(wrapper.find('.state-message--error button').exists()).toBe(true)
  })

  it('permet de modifier une note (PUT)', async () => {
    notesApi.getNote.mockResolvedValue({ id: '1', title: 'Courses', content: ['Lait'], color: 'green' })
    notesApi.updateNote.mockResolvedValue({ id: '1', title: 'Courses modifiées', content: ['Pain'], color: 'green' })

    const { wrapper } = await mountNoteDetail('1')

    await wrapper.find('.btn-primary').trigger('click') // "Modifier"
    await wrapper.find('#note-title').setValue('Courses modifiées')
    await wrapper.find('#note-content').setValue('Pain')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(notesApi.updateNote).toHaveBeenCalledWith('1', {
      title: 'Courses modifiées',
      content: ['Pain'],
      color: 'green',
    })
    expect(wrapper.text()).toContain('Courses modifiées')
  })

  it('demande confirmation avant de supprimer', async () => {
    notesApi.getNote.mockResolvedValue({ id: '1', title: 'Courses', content: ['Lait'], color: 'green' })
    notesApi.deleteNote.mockResolvedValue(true)

    const { wrapper } = await mountNoteDetail('1')

    await wrapper.find('.postit-detail .btn-danger').trigger('click')
    await flushPromises()

    const dialog = document.body.querySelector('.confirm-dialog')
    expect(dialog).toBeTruthy()

    dialog.querySelector('.btn-danger').dispatchEvent(new Event('click', { bubbles: true }))
    await flushPromises()

    expect(notesApi.deleteNote).toHaveBeenCalledWith('1')
  })
})

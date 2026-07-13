import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotePost from '../NotePost.vue'
import { useToastStore } from '@/stores/toast'
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
  const toastStore = useToastStore(pinia)
  return { wrapper, router, toastStore }
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

    // l'ordre affiché dépend du tri par récence, donc on cible la carte
    // "Courses" (id '1') explicitement plutôt que "la première carte"
    const courseCard = wrapper.findAll('.postit-card').find((card) => card.text().includes('Courses'))
    await courseCard.find('.btn-danger').trigger('click')
    await flushPromises()

    // la modale est téléportée dans document.body
    const dialog = document.body.querySelector('.confirm-dialog')
    expect(dialog).toBeTruthy()
    expect(notesApi.deleteNote).not.toHaveBeenCalled()

    dialog.querySelector('.btn-danger').dispatchEvent(new Event('click', { bubbles: true }))
    await flushPromises()

    expect(notesApi.deleteNote).toHaveBeenCalledWith('1')
  })

  it('affiche 9 notes par page et permet de naviguer entre les pages', async () => {
    const manyNotes = Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      title: `Note ${i + 1}`,
      content: ['x'],
      color: 'yellow',
    }))
    notesApi.getNotes.mockResolvedValue(manyNotes)
    const { wrapper } = await mountNotePost()
    const paginationButton = (label) =>
      wrapper.findAll('.pagination button').find((btn) => btn.text() === label)

    expect(wrapper.findAll('.postit-card')).toHaveLength(9)
    expect(wrapper.find('.pagination__info').text()).toBe('Page 1 / 2')
    expect(paginationButton('« Début').attributes('disabled')).toBeDefined()
    expect(paginationButton('← Précédent').attributes('disabled')).toBeDefined()
    expect(paginationButton('Suivant →').attributes('disabled')).toBeUndefined()
    expect(paginationButton('Fin »').attributes('disabled')).toBeUndefined()

    await paginationButton('Suivant →').trigger('click')

    expect(wrapper.findAll('.postit-card')).toHaveLength(3)
    expect(wrapper.find('.pagination__info').text()).toBe('Page 2 / 2')
    expect(paginationButton('Suivant →').attributes('disabled')).toBeDefined()
    expect(paginationButton('Fin »').attributes('disabled')).toBeDefined()
  })

  it('les boutons Début et Fin sautent directement à la première/dernière page', async () => {
    const manyNotes = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      title: `Note ${i + 1}`,
      content: ['x'],
      color: 'yellow',
    }))
    notesApi.getNotes.mockResolvedValue(manyNotes)
    const { wrapper } = await mountNotePost()
    const paginationButton = (label) =>
      wrapper.findAll('.pagination button').find((btn) => btn.text() === label)

    expect(wrapper.find('.pagination__info').text()).toBe('Page 1 / 3')

    await paginationButton('Fin »').trigger('click')
    expect(wrapper.find('.pagination__info').text()).toBe('Page 3 / 3')
    expect(wrapper.findAll('.postit-card')).toHaveLength(7) // 25 - 2*9

    await paginationButton('« Début').trigger('click')
    expect(wrapper.find('.pagination__info').text()).toBe('Page 1 / 3')
  })

  it('filtre par couleur', async () => {
    const mixed = [
      { id: '1', title: 'Courses', content: ['x'], color: 'yellow' },
      { id: '2', title: 'Sport', content: ['x'], color: 'blue' },
    ]
    notesApi.getNotes.mockResolvedValue(mixed)
    const { wrapper } = await mountNotePost()

    await wrapper.find('.color-chip[aria-label="Bleu"]').trigger('click')

    expect(wrapper.text()).toContain('Sport')
    expect(wrapper.text()).not.toContain('Courses')

    await wrapper.find('.color-chip--all').trigger('click')

    expect(wrapper.text()).toContain('Courses')
    expect(wrapper.text()).toContain('Sport')
  })

  it('trie par titre quand on choisit "Titre (A → Z)"', async () => {
    const mixed = [
      { id: '1', title: 'Zebre', content: ['x'], color: 'yellow' },
      { id: '2', title: 'Abricot', content: ['x'], color: 'blue' },
    ]
    notesApi.getNotes.mockResolvedValue(mixed)
    const { wrapper } = await mountNotePost()

    await wrapper.find('.sort-select').setValue('title')

    const titles = wrapper.findAll('.postit-card__title').map((t) => t.text())
    expect(titles).toEqual(['Abricot', 'Zebre'])
  })

  it('ne montre pas la pagination quand tout tient sur une page', async () => {
    notesApi.getNotes.mockResolvedValue(notes)
    const { wrapper } = await mountNotePost()

    expect(wrapper.find('.pagination').exists()).toBe(false)
  })

  it('affiche un toast de succès après une création', async () => {
    notesApi.getNotes.mockResolvedValue([])
    notesApi.createNote.mockResolvedValue({ id: '9', title: 'Nouvelle', content: ['x'], color: 'orange' })
    const { wrapper, toastStore } = await mountNotePost()

    await wrapper.find('.btn-primary').trigger('click') // ouvre le formulaire
    await wrapper.find('#note-title').setValue('Nouvelle')
    await wrapper.find('#note-content').setValue('x')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(toastStore.toasts.map((t) => t.message)).toContain('Post-it ajouté')
  })

  it('duplique une note existante', async () => {
    notesApi.getNotes.mockResolvedValue(notes)
    notesApi.createNote.mockResolvedValue({
      id: '3',
      title: 'Courses (copie)',
      content: ['Lait'],
      color: 'yellow',
    })
    const { wrapper, toastStore } = await mountNotePost()

    const courseCard = wrapper.findAll('.postit-card').find((card) => card.text().includes('Courses'))
    const duplicateButton = courseCard.findAll('button').find((btn) => btn.text() === 'Dupliquer')
    await duplicateButton.trigger('click')
    await flushPromises()

    expect(notesApi.createNote).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Courses (copie)' }),
    )
    expect(toastStore.toasts.map((t) => t.message)).toContain('Post-it dupliqué')
  })

  it('réordonne les notes quand une carte est déposée sur une autre', async () => {
    notesApi.getNotes.mockResolvedValue(notes)
    const { wrapper } = await mountNotePost()

    // l'ordre initial dépend du tri par récence (non déterministe à la
    // milliseconde près), donc on repère dynamiquement où est "Sport" et on
    // y dépose "Courses" (id '1') dessus : pour 2 notes, ça doit toujours
    // inverser l'ordre affiché.
    const initialTitles = wrapper.findAll('.postit-card__title').map((t) => t.text())
    const targetIndex = initialTitles.indexOf('Sport')
    const cards = wrapper.findAll('.postit-card')
    await cards[targetIndex].trigger('drop', { dataTransfer: { getData: () => '1' } })

    const titlesAfter = wrapper.findAll('.postit-card__title').map((t) => t.text())
    expect(titlesAfter).toEqual([...initialTitles].reverse())
  })
})

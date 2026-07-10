import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteModifier from '../NoteModifier.vue'

describe('NoteModifier', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty in create mode, orange selected by default', () => {
    const wrapper = mount(NoteModifier)

    expect(wrapper.find('h3').text()).toContain('Nouveau post-it')
    expect(wrapper.find('#note-title').element.value).toBe('')
    expect(wrapper.find('.color-swatch--active').attributes('aria-label')).toBe('Orange')
  })

  it('limite la longueur du titre et du contenu', () => {
    const wrapper = mount(NoteModifier)

    expect(wrapper.find('#note-title').attributes('maxlength')).toBe('60')
    expect(wrapper.find('#note-content').attributes('maxlength')).toBe('500')
    expect(wrapper.text()).toContain('0/60')
    expect(wrapper.text()).toContain('0/500')
  })

  it('pre-fills the form when a note prop is given (edit mode)', () => {
    const note = { title: 'Existant', content: ['ligne 1', 'ligne 2'], color: 'blue' }
    const wrapper = mount(NoteModifier, { props: { note } })

    expect(wrapper.find('h3').text()).toContain('Modifier le post-it')
    expect(wrapper.find('#note-title').element.value).toBe('Existant')
    expect(wrapper.find('#note-content').element.value).toBe('ligne 1\nligne 2')
    expect(wrapper.find('.color-swatch--active').attributes('aria-label')).toBe('Bleu')
  })

  it('emits "submit" with the form payload, including the picked color', async () => {
    const wrapper = mount(NoteModifier)

    await wrapper.find('#note-title').setValue('Titre test')
    await wrapper.find('#note-content').setValue('Contenu test')
    await wrapper.findAll('.color-swatch')[2].trigger('click') // green
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      title: 'Titre test',
      content: ['Contenu test'],
      color: 'green',
    })
  })

  it('emits "cancel" when the cancel button is clicked', async () => {
    const wrapper = mount(NoteModifier)

    await wrapper.find('.btn-secondary').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('garde un brouillon en localStorage pendant la création', async () => {
    const wrapper = mount(NoteModifier)

    await wrapper.find('#note-title').setValue('Idée en cours')

    expect(JSON.parse(localStorage.getItem('postit_draft'))).toMatchObject({ title: 'Idée en cours' })
  })

  it('restaure le brouillon si le formulaire est remonté sans avoir été soumis', () => {
    localStorage.setItem(
      'postit_draft',
      JSON.stringify({ title: 'Reprise', content: 'du contenu', color: 'pink' }),
    )

    const wrapper = mount(NoteModifier)

    expect(wrapper.find('#note-title').element.value).toBe('Reprise')
    expect(wrapper.find('#note-content').element.value).toBe('du contenu')
    expect(wrapper.find('.color-swatch--active').attributes('aria-label')).toBe('Rose')
  })

  it('efface le brouillon une fois la note ajoutée', async () => {
    const wrapper = mount(NoteModifier)

    await wrapper.find('#note-title').setValue('Idée en cours')
    await wrapper.find('form').trigger('submit.prevent')

    expect(localStorage.getItem('postit_draft')).toBeNull()
  })

  it("efface le brouillon si on clique sur Annuler", async () => {
    const wrapper = mount(NoteModifier)

    await wrapper.find('#note-title').setValue('Idée abandonnée')
    await wrapper.find('.btn-secondary').trigger('click')

    expect(localStorage.getItem('postit_draft')).toBeNull()
  })

  it("ne touche pas au brouillon en mode édition", async () => {
    localStorage.setItem('postit_draft', JSON.stringify({ title: 'Brouillon existant', content: '', color: 'orange' }))
    const note = { title: 'Existant', content: ['x'], color: 'blue' }
    const wrapper = mount(NoteModifier, { props: { note } })

    await wrapper.find('#note-title').setValue('Existant modifié')

    expect(JSON.parse(localStorage.getItem('postit_draft'))).toMatchObject({ title: 'Brouillon existant' })
  })
})

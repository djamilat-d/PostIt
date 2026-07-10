import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteModifier from '../NoteModifier.vue'

describe('NoteModifier', () => {
  it('starts empty in create mode, orange selected by default', () => {
    const wrapper = mount(NoteModifier)

    expect(wrapper.find('h3').text()).toContain('Nouveau post-it')
    expect(wrapper.find('#note-title').element.value).toBe('')
    expect(wrapper.find('.color-swatch--active').attributes('aria-label')).toBe('Orange')
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
})

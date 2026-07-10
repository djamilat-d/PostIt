import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteCard from '../NoteCard.vue'

const note = {
  id: '42',
  title: 'Ma note',
  content: ['a'.repeat(100)],
  color: 'green',
}

describe('NoteCard', () => {
  it('renders the title and a truncated excerpt', () => {
    const wrapper = mount(NoteCard, { props: { note } })

    expect(wrapper.text()).toContain('Ma note')
    expect(wrapper.text()).toContain('…')
    expect(wrapper.find('.postit-card__excerpt').text().length).toBeLessThanOrEqual(81)
  })

  it('emits "view" with the note id when "Voir plus" is clicked', async () => {
    const wrapper = mount(NoteCard, { props: { note } })
    const viewButton = wrapper.findAll('button').find((btn) => btn.text().includes('Voir plus'))

    await viewButton.trigger('click')

    expect(wrapper.emitted('view')).toEqual([['42']])
  })

  it('emits "delete" with the note id when "Supprimer" is clicked', async () => {
    const wrapper = mount(NoteCard, { props: { note } })

    await wrapper.find('.btn-danger').trigger('click')

    expect(wrapper.emitted('delete')).toEqual([['42']])
  })

  it('emits "duplicate" with the note id when "Dupliquer" is clicked', async () => {
    const wrapper = mount(NoteCard, { props: { note } })
    const duplicateButton = wrapper.findAll('button').find((btn) => btn.text().includes('Dupliquer'))

    await duplicateButton.trigger('click')

    expect(wrapper.emitted('duplicate')).toEqual([['42']])
  })

  it('emits "reorder" when another card is dropped onto it', async () => {
    const wrapper = mount(NoteCard, { props: { note } })
    const dataTransfer = { getData: () => '7' }

    await wrapper.find('.postit-card').trigger('drop', { dataTransfer })

    expect(wrapper.emitted('reorder')).toEqual([[{ fromId: '7', toId: '42' }]])
  })
})

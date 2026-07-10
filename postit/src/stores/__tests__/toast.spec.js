import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../toast'

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty', () => {
    const store = useToastStore()
    expect(store.toasts).toEqual([])
  })

  it('success() ajoute un toast de type success', () => {
    const store = useToastStore()

    store.success('Post-it ajouté')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]).toMatchObject({ message: 'Post-it ajouté', type: 'success' })
  })

  it('error() ajoute un toast de type error', () => {
    const store = useToastStore()

    store.error('Oups')

    expect(store.toasts[0]).toMatchObject({ message: 'Oups', type: 'error' })
  })

  it('dismiss() retire un toast précis', () => {
    const store = useToastStore()
    const id = store.success('A')
    store.success('B')

    store.dismiss(id)

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0].message).toBe('B')
  })

  it('disparaît tout seul après quelques secondes', () => {
    const store = useToastStore()
    store.success('Coucou')

    expect(store.toasts).toHaveLength(1)
    vi.advanceTimersByTime(3500)

    expect(store.toasts).toHaveLength(0)
  })
})

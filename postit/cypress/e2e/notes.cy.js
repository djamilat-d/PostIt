// Parcours principal: liste, création, détail, suppression.
// L'API est mockée avec cy.intercept pour pas dépendre du serveur distant.

const listNote = { id: '1', title: 'Courses', content: ['Lait', 'Pain'] }

describe('Post-it notes', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/notes', { notes: [listNote] }).as('getNotes')
  })

  it('displays the list of notes on the home page', () => {
    cy.visit('/')
    cy.wait('@getNotes')
    cy.contains('h1', 'Mes Post-it')
    cy.contains('.postit-card__title', 'Courses')
  })

  it('creates a new note', () => {
    cy.intercept('POST', '**/notes', { note_id: '2' }).as('createNote')
    cy.visit('/')
    cy.wait('@getNotes')

    cy.contains('button', 'Ajouter un post-it').click()
    cy.get('#note-title').type('Sport')
    cy.get('#note-content').type('Aller courir')
    cy.get('.color-swatch[aria-label="Bleu"]').click()
    cy.contains('button', 'Ajouter').click()

    cy.wait('@createNote')
    cy.contains('.postit-card__title', 'Sport')
  })

  it('opens the detail view of a note', () => {
    cy.intercept('GET', '**/notes/1', { note: listNote }).as('getNote')
    cy.visit('/')
    cy.wait('@getNotes')

    cy.contains('.postit-card', 'Courses').contains('button', 'Voir plus').click()

    cy.url().should('include', '/note/1')
    cy.contains('h2', 'Courses')
  })

  it('deletes a note from the list after confirming in the modal', () => {
    cy.intercept('DELETE', '**/notes/1', {}).as('deleteNote')
    cy.visit('/')
    cy.wait('@getNotes')

    cy.contains('.postit-card', 'Courses').contains('button', 'Supprimer').click()
    cy.get('.confirm-dialog').should('be.visible').contains('button', 'Supprimer').click()

    cy.wait('@deleteNote')
    cy.contains('Aucun post-it pour le moment')
  })

  it('edits an existing note from the detail page', () => {
    cy.intercept('GET', '**/notes/1', { note: listNote }).as('getNote')
    cy.intercept('PUT', '**/notes/1', { note_id: '1' }).as('updateNote')
    cy.visit('/')
    cy.wait('@getNotes')

    cy.contains('.postit-card', 'Courses').contains('button', 'Voir plus').click()
    cy.url().should('include', '/note/1')

    cy.contains('button', 'Modifier').click()
    cy.get('#note-title').clear()
    cy.get('#note-title').type('Courses (maj)')
    cy.contains('button', 'Enregistrer').click()

    cy.wait('@updateNote')
    cy.contains('h2', 'Courses (maj)')
  })

  it('shows a 404 page on an unknown route', () => {
    cy.visit('/une-route-qui-existe-pas')
    cy.contains('Page introuvable')
    cy.contains('a', "Retour à l'accueil").click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})

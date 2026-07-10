# Post-it

Projet C-DEV-121 (MVVM frameworks) - une petite appli de gestion de post-it en Vue 3.

On peut créer, voir, modifier et supprimer des post-it. Les notes sont stockées via une API distante (pas de backend fait maison ici).

## Fonctionnalités

- liste des post-it sur la page d'accueil
- page détail par note (`/note/:id`)
- création / modification / suppression
- couleurs personnalisables par note
- responsive, un peu de style pour que ce soit pas trop moche

## Stack

- Vite + Vue 3 (Composition API, `<script setup>`)
- Vue Router (avec route dynamique `/note/:id`)
- Pinia pour le state (équivalent de Vuex, plus simple à écrire)
- fetch natif pour les appels API
- Vitest + @vue/test-utils pour les tests unitaires, Cypress pour l'e2e
- oxlint / eslint / oxfmt pour le lint

## Organisation du code

- `src/api/notes.js` : tous les appels fetch vers l'API sont ici, rien d'autre n'appelle fetch directement
- `src/stores/notes.js` : store Pinia, garde l'état (notes, loading, error) et expose les actions (fetchNotes, createNote, etc)
- `src/components/` : les vues et composants
  - `NotePost.vue` = page liste
  - `NoteDetail.vue` = page détail / édition
  - `NoteCard.vue` = carte d'une note dans la liste
  - `NoteModifier.vue` = le formulaire, utilisé pour créer ET éditer
  - `AppHeader.vue` = la nav

Les composants ne font jamais de fetch eux-mêmes, ils passent toujours par le store.

## Lancer le projet

```sh
npm install
cp .env.example .env
npm run dev
```

`VITE_API_BASE_URL` dans `.env` doit pointer vers l'API (par défaut `https://postit.zoul.dev`).

Autres scripts utiles :

```sh
npm run build         # build prod
npm run test:unit      # tests unitaires
npm run test:e2e:dev   # tests e2e en dev
npm run lint          # oxlint + eslint
```

## API utilisée

| Méthode | Route | Usage |
| --- | --- | --- |
| GET | `/notes` | liste des notes |
| GET | `/notes/:id` | une note |
| POST | `/notes` | créer |
| PUT | `/notes/:id` | modifier |
| DELETE | `/notes/:id` | supprimer |

La couleur n'est pas gérée côté API, donc elle est gardée en local (localStorage) par id de note.

## Tests

Unitaires sur le store et sur `NoteCard` / `NoteModifier` (API mockée). E2E dans `cypress/e2e/notes.cy.js`, avec l'API stubbée via `cy.intercept` pour pas dépendre du serveur.

## Idées si j'ai le temps

- éviter de perdre la saisie du formulaire si on quitte la page en cours de création
- recherche/filtre dans la liste si trop de notes

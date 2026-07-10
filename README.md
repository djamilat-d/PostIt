# Post-it

Projet C-DEV-121 (MVVM frameworks) - une petite appli de gestion de post-it en Vue 3.

On peut créer, voir, modifier et supprimer des post-it. Les notes sont stockées via une API distante (pas de backend fait maison ici).

## Fonctionnalités

- liste des post-it sur la page d'accueil (avec recherche et pagination)
- page détail par note (`/note/:id`)
- création / modification / suppression (avec confirmation avant de supprimer) / duplication
- couleurs personnalisables par note, longueur du titre et du contenu limitée
- tri automatique des notes les plus récentes en premier, réordonnable à la main par glisser-déposer
- brouillon de création sauvegardé automatiquement (pas perdu si on quitte la page avant de valider)
- petites notifications (toasts) après une création/modification/suppression/duplication
- écrans de chargement avec un effet skeleton plutôt qu'un texte "Chargement..."
- mode sombre / clair
- page 404 pour les urls invalides
- responsive, un peu de style pour que ce soit pas trop moche

## Stack

- Vite + Vue 3 (Composition API, `<script setup>`)
- Vue Router (avec route dynamique `/note/:id` + catch-all 404)
- Pinia pour le state (équivalent de Vuex, plus simple à écrire)
- fetch natif pour les appels API
- Vitest + @vue/test-utils pour les tests unitaires, Cypress pour l'e2e
- oxlint / eslint / oxfmt pour le lint

## Organisation du code

- `src/api/notes.js` : tous les appels fetch vers l'API sont ici, rien d'autre n'appelle fetch directement
- `src/stores/notes.js` : store Pinia, garde l'état (notes, loading, error) et expose les actions (fetchNotes, createNote, reorderNotes, etc). Gère aussi la couleur, la date de création et l'ordre manuel en localStorage puisque l'API ne les fournit pas.
- `src/stores/toast.js` : store Pinia pour les petites notifications de succès/erreur.
- `src/components/` : les vues et composants
  - `NotePost.vue` = page liste (recherche, pagination, création)
  - `NoteDetail.vue` = page détail / édition
  - `NoteCard.vue` = carte d'une note dans la liste (drag & drop pour réordonner)
  - `NoteCardSkeleton.vue` = silhouette animée affichée pendant le chargement
  - `NoteModifier.vue` = le formulaire, utilisé pour créer ET éditer
  - `AppHeader.vue` = la nav + le bouton de thème
  - `ConfirmDialog.vue` = modale de confirmation (suppression)
  - `ToastContainer.vue` = affichage des notifications, monté une fois dans `App.vue`
  - `NotFound.vue` = page 404

Les composants ne font jamais de fetch eux-mêmes, ils passent toujours par le store.

## Lancer le projet

```sh
cd postit
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

La couleur, la date de création et l'ordre manuel (drag & drop) ne sont pas gérés côté API, donc ils sont gardés en local (localStorage) par id de note. Le brouillon de création (`postit_draft`) et le thème choisi (`postit_theme`) sont aussi en localStorage.

## Tests

Unitaires sur les stores (`notes`, `toast`) et sur `NoteCard`, `NoteModifier`, `NotePost`, `NoteDetail` (API mockée à chaque fois). E2E dans `cypress/e2e/notes.cy.js` : liste, création, détail, édition, suppression, duplication, thème et 404, avec l'API stubbée via `cy.intercept`.


import { createRouter, createWebHistory } from 'vue-router'
import NotePost from '@/components/NotePost.vue'
import NoteDetail from '@/components/NoteDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NotePost,
    },
    // route dynamique: l'id est dans l'url (/note/42) et arrive
    // directement en prop dans NoteDetail
    {
      path: '/note/:id',
      name: 'detail-note',
      component: NoteDetail,
      props: true,
    },
  ],
})

export default router

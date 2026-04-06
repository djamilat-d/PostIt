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
    {
      path: '/details',
      name: 'detail-note',
      component: NoteDetail,
    }
  ],
})

export default router

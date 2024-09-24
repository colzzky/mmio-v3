import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import registerRoutes from '@/modules/register/routes'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  ...registerRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

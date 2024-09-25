import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import authenticationRoutes from '@/modules/authentication/routes'
import servicesRoutes from '@/modules/services/routes'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  ...authenticationRoutes,
  ...servicesRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

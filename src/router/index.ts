import authenticationRoutes from '@/modules/authentication/routes'
import { routes as metaRoutes } from '@/modules/meta/routes'
import { routes as settingsRoutes } from '@/modules/settings/routes'
import othersRoutes from '@/modules/try/routes'
import { useAuthStore } from '@/stores/authStore'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      requiresAuth: true,
    },
    component: () => import('@/views/HomeView.vue'),
    //add children here
  },
  ...authenticationRoutes,
  ...metaRoutes,
  ...settingsRoutes,
  ...othersRoutes,
] as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const { user_auth } = authStore
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const nonAuth = to.matched.some((record) => record.meta.nonAuth)

  if (requiresAuth) {
    const checkUser = user_auth.checkUser()
    if (!checkUser) return next({ name: 'login' })
    return next()
  }
  if (nonAuth) {
    const checkUser = user_auth.checkUser()
    if (checkUser) return next({ name: 'home' })
    return next()
  } else {
    return next()
  }
})

export default router

import authenticationRoutes from '@/modules/authentication/routes'
import { routes as metaRoutes } from '@/modules/meta/routes'
import { routes as settingsRoutes } from '@/modules/settings/routes'
import othersRoutes from '@/modules/try/routes'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '@/views/HomeView.vue'
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
  {
    path: '/project',
    name: 'project',
    meta: {
      requiresAuth: true,
    },
    component: () => HomeView,
  },
  {
    path: '/project/:id',
    name: 'project-overview',
    meta: {
      requiresAuth: true,
    },
    component: () => {
      return HomeView
    },
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

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  const { user_auth } = authStore
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const nonAuth = to.matched.some((record) => record.meta.nonAuth)
  if (!from.name) {
    console.log('initializing....')
    await user_auth.initializeUser()
  }
  const check_if_userexist = await user_auth.check_user_auth()
  if (requiresAuth) {
    if (!check_if_userexist) return { name: 'login' }
  }
  if (nonAuth) {
    if (check_if_userexist) return { name: 'home' }
  }


  return true
})

export default router

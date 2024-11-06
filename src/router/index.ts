import authenticationRoutes from '@/modules/authentication/routes'
import { routes as metaRoutes } from '@/modules/meta/routes'
import { routes as settingsRoutes } from '@/modules/settings/routes'
import othersRoutes from '@/modules/try/routes'
import { useAuthStore } from '@/stores/authStore'
import { usePlatformAPIStore } from '@/stores/platformAPIStore'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/',
    meta: { requiresAuth: true },
    component: () => import('@/core/layouts/home.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: 'workspace/:workspaceId',
        component: () => import('@/core/layouts/workspace.vue'),
        children: [...metaRoutes],
      },
    ],
  },

  {
    path: '/home2',
    name: 'home2',
    meta: { requiresAuth: true },
    component: () => import('@/views/HomeView2.vue'),
  },

  ...authenticationRoutes,
  ...settingsRoutes,
  ...othersRoutes,
] as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  const platformApiStore = usePlatformAPIStore()
  const { user_auth, page_init } = authStore

  const { platform_api_list } = platformApiStore
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const nonAuth = to.matched.some((record) => record.meta.nonAuth)
  if (!from.name) {
    page_init.initialize = false
    console.log('initializing....')
    await user_auth.initializeUser()
    await platform_api_list.initializeAccountApis()
    page_init.initialize = true
  }
  const check_if_userexist = await user_auth.check_user_auth()
  console.log(check_if_userexist)
  if (requiresAuth) {
    if (!check_if_userexist) return { name: 'login' }
  }
  if (nonAuth) {
    if (check_if_userexist) return { name: 'home' }
  }

  return true
})

export default router

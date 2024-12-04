import authenticationRoutes from '@/modules/authentication/routes'
import { routes as metaRoutes } from '@/modules/meta/routes'
import { routes as settingsRoutes } from '@/modules/settings/routes'
import { routes as teamsAndPermissionsRoutes } from '@/modules/teams-permissions/routes'
import othersRoutes from '@/modules/try/routes'
import { routes as workspaceSettingsRoutes } from '@/modules/workspace-settings/routes'
import { useAuthStore } from '@/stores/authStore'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/homepage/page.vue'),
      },
      {
        path: 'workspace/:workspaceId',
        name: 'workspace',
        component: () => import('@/core/layouts/workspace.vue'),
        children: [
          {
            path: 'platforms',
            name: 'all-platforms',
            component: () => import('@/modules/platforms/page.vue'),
          },
          ...workspaceSettingsRoutes,
          ...metaRoutes,
        ],
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
  ...teamsAndPermissionsRoutes,
  ...othersRoutes,
] as RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async(to, from) => {
  const authStore = useAuthStore();
  const { user_auth, page_init, after_auth_initialization } = authStore;

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const nonAuth = to.matched.some((record) => record.meta.nonAuth);
  let check_if_userexist = user_auth.data ? true : false
  
  if (!from.name) {
    (async () => {
      console.log('Initializing...');
      page_init.initialize = false; // Mark initialization as in progress
      check_if_userexist = await user_auth.check_user_auth();
      if(check_if_userexist){
        await user_auth.initializeUser();
        await after_auth_initialization();
      }

      page_init.initialize = true; // Mark initialization as complete
    })();
    // Redirect to home to display the loading state
  }
  const check_auth = user_auth.isUserAuthenticated()
  if (requiresAuth && !check_if_userexist && !check_auth) return { name: 'login' };
  if (nonAuth && check_if_userexist && check_auth) return { name: 'home' };

  return true;
});

export default router

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    meta: {
      nonAuth: true
    },
    component: () => import('./views/LoginPage.vue'),
  },
  {
    path: '/register',
    name: 'register',
    meta: {
      nonAuth: true
    },
    component: () => import('./views/RegisterPage.vue'),
  },
]

export default routes

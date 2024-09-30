import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/others',
    name: 'others',
    component: () => import('./views/OthersPage.vue'),
  },
]

export default routes

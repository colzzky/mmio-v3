import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/meta',
    name: 'meta',
    component: () => import('./views/MetaHomePage.vue'),
  },
]

export default routes

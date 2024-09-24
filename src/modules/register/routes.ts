import type { RouteRecordRaw } from 'vue-router'

const prefix = 'register'

const routes: RouteRecordRaw[] = [
  {
    path: `/${prefix}`,
    name: prefix,
    component: () => import('./views/RegisterPage.vue')
  }
]

export default routes

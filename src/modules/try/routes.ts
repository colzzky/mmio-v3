import type { RouteRecordRaw } from 'vue-router'
import Other from './views/Try.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/other',
    name: 'other',
    component: Other,
  }
]

export default routes

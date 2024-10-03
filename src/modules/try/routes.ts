import type { RouteRecordRaw } from 'vue-router'
import Other from './views/try.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/other',
    name: 'other',
    component: Other,
  }
]

export default routes

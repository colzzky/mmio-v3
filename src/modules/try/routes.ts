import Other from './views/MessengerSendAPI.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/other',
    name: 'other',
    component: Other,
  },
]

export default routes

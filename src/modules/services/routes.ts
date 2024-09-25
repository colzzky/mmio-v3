import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/services',
    name: 'services',
    component: () => import('./views/ServicesListingPage.vue'),
  },
]

export default routes

import type { RouteRecordRaw } from 'vue-router'

const names = ['general', 'integrations', 'languages'] as const

type RouteRecord = Record<(typeof names)[number], Omit<RouteRecordRaw, 'name'>>

const childrenRouteRecords: RouteRecord = {
  general: {
    path: '',
    component: () => import('@/modules/workspace-settings/views/general-page.vue'),
  },
  integrations: {
    path: 'integrations',
    component: () => import('@/modules/workspace-settings/views/integrations-page.vue'),
  },
  languages: {
    path: 'languages',
    component: () => import('@/modules/workspace-settings/views/languages-page.vue'),
  },
}
const childrenRoutes = Object.entries(childrenRouteRecords).map(([key, values]) => ({
  ...values,
  name: `workspace-settings-${key}`,
})) as RouteRecordRaw[]

export const routes: RouteRecordRaw[] = [
  {
    path: 'settings',
    component: () => import('@/core/layouts/workspace-settings.vue'),
    children: childrenRoutes,
  },
]

import type { RouteRecordRaw } from 'vue-router'

type Section = 'personal' | 'group'

const names = ['teams', 'permissions'] as const

type Categories = Record<(typeof names)[number], { label: string; icon: string; section: Section }>
const categories: Categories = {
  teams: {
    label: 'Teams',
    icon: 'bxs-user-account',
    section: 'personal',
  },
  permissions: {
    label: 'Permissions',
    icon: 'bxs-user-circle',
    section: 'personal',
  },
}

type RouteRecord = Record<(typeof names)[number], Omit<RouteRecordRaw, 'path' | 'name'>>
const childrenRouteRecords: RouteRecord = {
  teams: {
    component: () => import('./page.vue'),
    children: [
      {
        path: ':team_id',
        name: 'team-view',
        component: () => import('./page.vue'),
      },
    ],
  },
  permissions: {
    component: () => import('./page.vue'),
    children: [
      {
        path: ':permission_id',
        name: 'permission-view',
        component: () => import('./page.vue'),
      },
    ],
  },
}
const childrenRoutes = Object.entries(childrenRouteRecords).map(([key, values]) => ({
  ...values,
  name: key,
  path: key,
})) as RouteRecordRaw[]

export const sidebarLinks = Object.entries(categories).map(([key, value]) => ({
  ...value,
  name: key,
}))

export const routes: RouteRecordRaw[] = [
  {
    path: '/team-permission',
    name: 'team-permission',
    meta: { requiresAuth: true },
    component: () => import('./page.vue'),
    children: childrenRoutes,
  },
  {
    path: '/team-invite/:invi_id',
    name: 'team-invite',
    meta: { requiresAuth: true },
    component: () => import('./views/team-invite.vue'),
  },
  {
    path: '/member-invite/:invi_id',
    name: 'member-invite',
    meta: { requiresAuth: true },
    component: () => import('./views/member-invite.vue'),
  },
]

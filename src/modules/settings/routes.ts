import type { RouteRecordRaw } from 'vue-router'

type Section = 'personal' | 'group'

const names = [
  'account',
  'profile',
  'plans',
  'payments-and-billings',
  'api-integrations',
  'team',
  'project-management',
] as const

type LinkRecord = Record<(typeof names)[number], { label: string; icon: string; section: Section }>
const linkRecords: LinkRecord = {
  account: {
    label: 'Account',
    icon: 'bxs-user-account',
    section: 'personal',
  },
  profile: {
    label: 'Profile',
    icon: 'bxs-user-circle',
    section: 'personal',
  },
  plans: {
    label: 'Plans',
    icon: 'bxs-tag',
    section: 'personal',
  },
  'payments-and-billings': {
    label: 'Payments and Billings',
    icon: 'bxs-credit-card',
    section: 'personal',
  },
  'api-integrations': {
    label: 'API Integrations',
    icon: 'bxs-plug',
    section: 'personal',
  },
  team: {
    label: 'Team',
    icon: 'bxs-group',
    section: 'group',
  },
  'project-management': {
    label: 'Project Management',
    icon: 'bxs-folder',
    section: 'group',
  },
}

type RouteRecord = Record<(typeof names)[number], Omit<RouteRecordRaw, 'path' | 'name'>>
const childrenRouteRecords: RouteRecord = {
  account: {
    component: () => import('./views/AccountPage.vue'),
  },
  profile: {
    component: () => import('./views/ProfilePage.vue'),
  },
  plans: {
    component: () => import('./views/PlansPage.vue'),
  },
  'payments-and-billings': {
    component: () => import('./views/AccountPage.vue'),
  },
  'api-integrations': {
    component: () => import('./views/ApiIntegrationPage.vue'),
  },
  team: {
    component: () => import('./views/AccountPage.vue'),
  },
  'project-management': {
    component: () => import('./views/AccountPage.vue'),
  },
}

export const links = Object.entries(linkRecords).map(([key, value]) => ({
  ...value,
  name: key,
}))

const childrenRoutes = Object.entries(childrenRouteRecords).map(([key, values]) => ({
  ...values,
  name: key,
  path: key,
})) as RouteRecordRaw[]

export const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: 'settings',
    meta: { requiresAuth: true },
    component: () => import('@/core/layouts/settings.vue'),
    children: childrenRoutes,
  },
]

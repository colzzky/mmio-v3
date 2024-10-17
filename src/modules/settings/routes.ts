import type { RouteRecordRaw } from 'vue-router'

type Section = 'personal' | 'group'

const names = [
  'settings-account',
  'settings-profile',
  'settings-plans',
  'settings-payments-and-billings',
  'settings-api-integrations',
  'settings-team',
  'settings-project-management',
] as const

const urls: Record<(typeof names)[number], string> = {
  'settings-account': '/settings/account',
  'settings-profile': '/settings/profile',
  'settings-plans': '/settings/plans',
  'settings-payments-and-billings': '/settings/payments-and-billings',
  'settings-api-integrations': '/settings/api-integrations',
  'settings-team': '/settings/team',
  'settings-project-management': '/settings/project-management',
}

const linkRecords: Record<
  (typeof names)[number],
  { label: string; icon: string; section: Section }
> = {
  'settings-account': {
    label: 'Account',
    icon: 'bxs-user-account',
    section: 'personal',
  },
  'settings-profile': {
    label: 'Profile',
    icon: 'bxs-user-circle',
    section: 'personal',
  },
  'settings-plans': {
    label: 'Plans',
    icon: 'bxs-tag',
    section: 'personal',
  },
  'settings-payments-and-billings': {
    label: 'Payments and Billings',
    icon: 'bxs-credit-card',
    section: 'personal',
  },
  'settings-api-integrations': {
    label: 'API Integrations',
    icon: 'bxs-plug',
    section: 'personal',
  },
  'settings-team': {
    label: 'Team',
    icon: 'bxs-group',
    section: 'group',
  },
  'settings-project-management': {
    label: 'Project Management',
    icon: 'bxs-folder',
    section: 'group',
  },
}

const routeRecords: Record<(typeof names)[number], Omit<RouteRecordRaw, 'path' | 'name'>> = {
  'settings-account': {
    meta: { requiresAuth: true },
    component: () => import('./views/AccountPage.vue'),
  },
  'settings-profile': {
    meta: { requiresAuth: true },
    component: () => import('./views/ProfilePage.vue'),
  },
  'settings-plans': {
    meta: { requiresAuth: true },
    component: () => import('./views/PlansPage.vue'),
  },
  'settings-payments-and-billings': {
    meta: { requiresAuth: true },
    component: () => import('./views/AccountPage.vue'),
  },
  'settings-api-integrations': {
    meta: { requiresAuth: true },
    component: () => import('./views/AccountPage.vue'),
  },
  'settings-team': {
    meta: { requiresAuth: true },
    component: () => import('./views/AccountPage.vue'),
  },
  'settings-project-management': {
    meta: { requiresAuth: true },
    component: () => import('./views/AccountPage.vue'),
  },
}

export const links = Object.entries(linkRecords).map(([key, value]) => ({
  ...value,
  href: urls[key],
}))

export const routes = Object.entries(routeRecords).map(([key, values]) => ({
  ...values,
  name: key,
  path: urls[key],
}))

import type { RouteRecordRaw } from 'vue-router'

type Section = 'personal' | 'group'

const urls = [
  '/settings/account',
  '/settings/profile',
  '/settings/payments-and-billings',
  '/settings/api-integrations',
  '/settings/team',
  '/settings/project-management',
] as const

type AllUrl = (typeof urls)[number]

const urlLinks: Record<AllUrl, { label: string; icon: string; section: Section }> = {
  '/settings/account': {
    label: 'Account',
    icon: 'bxs-user-account',
    section: 'personal',
  },
  '/settings/profile': {
    label: 'Profile',
    icon: 'bxs-user-circle',
    section: 'personal',
  },
  '/settings/payments-and-billings': {
    label: 'Payments and Billings',
    icon: 'bxs-credit-card',
    section: 'personal',
  },
  '/settings/api-integrations': {
    label: 'API Integrations',
    icon: 'bxs-plug',
    section: 'personal',
  },
  '/settings/team': {
    label: 'Team',
    icon: 'bxs-group',
    section: 'group',
  },
  '/settings/project-management': {
    label: 'Project Management',
    icon: 'bxs-folder',
    section: 'group',
  },
}

export const links = Object.entries(urlLinks).map(([key, value]) => ({ ...value, href: key }))

const routeRecords: Record<AllUrl, Omit<RouteRecordRaw, 'path'>> = {
  '/settings/account': {
    name: 'settings-account',
    component: () => import('./views/AccountPage.vue'),
  },
  '/settings/profile': {
    name: 'settings-profile',
    component: () => import('./views/AccountPage.vue'),
  },
  '/settings/payments-and-billings': {
    name: 'settings-payments-and-billings',
    component: () => import('./views/AccountPage.vue'),
  },
  '/settings/api-integrations': {
    name: 'settings-api-integrations',
    component: () => import('./views/AccountPage.vue'),
  },
  '/settings/team': {
    name: 'settings-team',
    component: () => import('./views/AccountPage.vue'),
  },
  '/settings/project-management': {
    name: 'settings-project-management',
    component: () => import('./views/AccountPage.vue'),
  },
}

export const routes = Object.entries(routeRecords).map(([key, values]) => ({
  path: key,
  ...values,
}))

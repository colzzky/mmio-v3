import type { RouteRecordRaw } from 'vue-router'

export interface Service {
  label: string
  icon: string
  description: string
  pinned: boolean
}

type RouteRecord = Record<(typeof names)[number], Omit<RouteRecordRaw, 'path' | 'name'>>
type ServiceRecord = Record<(typeof servicesName)[number], Service>

const platformName = 'meta' as const

const servicesName = [
  'meta-chatbot-flow-builder',
  'meta-comment-auto-reply',
  'meta-post-randomizer',
  'meta-livestream',
  'meta-interest-finder',
  'meta-live-chat',
  'meta-subscribers',
  'meta-growth-tools',
  'meta-chat-broadcast',
  'meta-chat-sequences',
] as const

const names = [
  platformName,
  ...servicesName,
  'meta-messenger-webview',
  'meta-persistent-menu',
  'meta-welcome-message',
  'meta-ice-breakers',
  'meta-get-started',
  'meta-keywords',
  'meta-chatbot-defaults',
  'meta-marketing-messages',
] as const

const urls: Record<(typeof names)[number], string> = {
  meta: '/project/:pj_id/meta',
  'meta-chatbot-flow-builder': '/project/:pj_id/meta/chatbot-flow-builder',
  'meta-comment-auto-reply': '/project/:pj_id/meta/comment-auto-reply',
  'meta-post-randomizer': '/project/:pj_id/meta/post-randomizer',
  'meta-livestream': '/project/:pj_id/meta/livestream',
  'meta-interest-finder': '/project/:pj_id/meta/interest-finder',
  'meta-live-chat': '/project/:pj_id/meta/live-chat',
  'meta-subscribers': '/project/:pj_id/meta/subscribers',
  'meta-growth-tools': '/project/:pj_id/meta/growth-tools',
  'meta-chat-broadcast': '/project/:pj_id/meta/chat-broadcast',
  'meta-chat-sequences': '/project/:pj_id/meta/chat-sequences',
  'meta-messenger-webview': '/project/:pj_id/meta/messenger-webview',
  'meta-persistent-menu': '/project/:pj_id/meta/persistent-menu',
  'meta-welcome-message': '/project/:pj_id/meta/welcome-message',
  'meta-ice-breakers': '/project/:pj_id/meta/ice-breakers',
  'meta-get-started': '/project/:pj_id/meta/get-started',
  'meta-keywords': '/project/:pj_id/meta/keywords',
  'meta-chatbot-defaults': '/project/:pj_id/meta/chatbot-defaults',
  'meta-marketing-messages': '/project/:pj_id/meta/marketing-messages',
}

const servicesRecord: ServiceRecord = {
  'meta-chatbot-flow-builder': {
    icon: 'bx-network-chart',
    label: 'Chatbot Flow Builder',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-comment-auto-reply': {
    icon: 'bx-conversation',
    label: 'Comment Auto Reply',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-post-randomizer': {
    icon: 'bx-message-dots',
    label: 'Post Randomizer',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-livestream': {
    icon: 'bx-video',
    label: 'Livestream',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-interest-finder': {
    icon: 'bx-file-find',
    label: 'Interest Finder',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-live-chat': {
    icon: 'bx-message-dots',
    label: 'Live Chat',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-subscribers': {
    icon: 'bx-group',
    label: 'Subscribers',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-growth-tools': {
    icon: 'bx-chart',
    label: 'Growth Tools',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-chat-broadcast': {
    icon: 'bx-broadcast',
    label: 'Chat Broadcast',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'meta-chat-sequences': {
    icon: 'bx-comment-add',
    label: 'Chat Sequences',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
}

const routeRecords: RouteRecord = {
  meta: {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-chatbot-flow-builder': {
    meta: { requiresAuth: true },
    component: () => import('./services/chatbot-flow-builder/page.vue'),
  },
  'meta-comment-auto-reply': {
    meta: { requiresAuth: true },
    component: () => import('./services/comment-auto-reply/page.vue'),
  },
  'meta-post-randomizer': {
    meta: { requiresAuth: true },
    component: () => import('./services/post-randomizer/page.vue'),
  },
  'meta-livestream': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-interest-finder': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-live-chat': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-subscribers': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-growth-tools': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-chat-broadcast': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-chat-sequences': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-messenger-webview': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-persistent-menu': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-welcome-message': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-ice-breakers': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-get-started': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-keywords': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-chatbot-defaults': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
  'meta-marketing-messages': {
    meta: { requiresAuth: true },
    component: () => import('./views/MetaHomePage.vue'),
  },
}

export const services = new Map(
  Object.entries(servicesRecord).map(([key, values]) => [
    key,
    {
      ...values,
      name: key,
      href: urls[key as keyof ServiceRecord],
    },
  ]),
)

export const routes = Object.entries(routeRecords).map(([key, values]) => ({
  ...values,
  path: urls[key as keyof RouteRecord],
  name: key,
}))

import type { RouteRecordRaw } from 'vue-router'

export interface Service {
  label: string
  icon: string
  description: string
  pinned: boolean
}

export const homeUrl = '/project/:pj_id/meta' as const

export const servicesUrl = [
  '/project/:pj_id/meta/chatbot-flow-builder',
  '/project/:pj_id/meta/comment-auto-reply',
  '/project/:pj_id/meta/post-randomizer',
  '/project/:pj_id/meta/livestream',
  '/project/:pj_id/meta/interest-finder',
  '/project/:pj_id/meta/live-chat',
  '/project/:pj_id/meta/subscribers',
  '/project/:pj_id/meta/growth-tools',
  '/project/:pj_id/meta/chat-broadcast',
  '/project/:pj_id/meta/chat-sequences',
] as const

type AllServicesUrl = (typeof servicesUrl)[number]

const servicesRecord: Record<AllServicesUrl, Service> = {
  '/project/:pj_id/meta/chatbot-flow-builder': {
    label: 'Chatbot Flow Builder',
    icon: 'bx-network-chart',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: true,
  },
  '/project/:pj_id/meta/comment-auto-reply': {
    label: 'Comment Auto Reply',
    icon: 'bx-conversation',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: true,
  },
  '/project/:pj_id/meta/post-randomizer': {
    label: 'Post Randomizer',
    icon: 'bx-message-dots',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: true,
  },
  '/project/:pj_id/meta/livestream': {
    label: 'Livestream',
    icon: 'bx-video',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/project/:pj_id/meta/interest-finder': {
    label: 'Interest Finder',
    icon: 'bx-file-find',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/project/:pj_id/meta/live-chat': {
    label: 'Live Chat',
    icon: 'bx-message-dots',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/project/:pj_id/meta/subscribers': {
    label: 'Subscribers',
    icon: 'bx-group',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/project/:pj_id/meta/growth-tools': {
    label: 'Growth Tools',
    icon: 'bx-chart',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/project/:pj_id/meta/chat-broadcast': {
    label: 'Chat Broadcast',
    icon: 'bx-broadcast',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/project/:pj_id/meta/chat-sequences': {
    label: 'Chat Sequences',
    icon: 'bx-comment-add',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
}

export const servicesMap = new Map(
  Object.entries(servicesRecord).map(([key, values]) => [key, values]),
)

const urls = [
  homeUrl,
  ...servicesUrl,
  '/project/:pj_id/meta/messenger-webview',
  '/project/:pj_id/meta/persistent-menu',
  '/project/:pj_id/meta/welcome-message',
  '/project/:pj_id/meta/ice-breakers',
  '/project/:pj_id/meta/get-started',
  '/project/:pj_id/meta/keywords',
  '/project/:pj_id/meta/chatbot-defaults',
  '/project/:pj_id/meta/marketing-messages',
] as const



type AllUrl = (typeof urls)[number]

const routeRecords: Record<AllUrl, Omit<RouteRecordRaw, 'path'>> = {
  '/project/:pj_id/meta': {
    name: 'meta',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/chatbot-flow-builder': {
    name: 'chatbot-flow-builder',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/ChatbotFlowBuilder.vue'),
  },
  '/project/:pj_id/meta/comment-auto-reply': {
    name: 'comment-auto-reply',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/post-randomizer': {
    name: 'post-randomizer',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/PostRandomizerPage.vue'),
  },
  '/project/:pj_id/meta/livestream': {
    name: 'livestream',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/interest-finder': {
    name: 'interest-finder',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/live-chat': {
    name: 'live-chat',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/subscribers': {
    name: 'subscribers',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/growth-tools': {
    name: 'growth-tools',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/chat-broadcast': {
    name: 'chat-broadcast',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/chat-sequences': {
    name: 'chat-sequences',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/messenger-webview': {
    name: 'messenger-webview',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/persistent-menu': {
    name: 'persistent-menu',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/welcome-message': {
    name: 'welcome-message',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/ice-breakers': {
    name: 'ice-breakers',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/get-started': {
    name: 'get-started',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/keywords': {
    name: 'keywords',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/chatbot-defaults': {
    name: 'chatbot-defaults',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/project/:pj_id/meta/marketing-messages': {
    name: 'marketing-messages',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
}

export const routes = Object.entries(routeRecords).map(([key, values]) => ({
  path: key,
  ...values,
}))

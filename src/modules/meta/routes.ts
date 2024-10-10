import type { RouteRecordRaw } from 'vue-router'

export interface Service {
  label: string
  icon: string
  description: string
  pinned: boolean
}

export const homeUrl = '/meta' as const

export const servicesUrl = [
  '/meta/chatbot-flow-builder',
  '/meta/comment-auto-reply',
  '/meta/post-randomizer',
  '/meta/livestream',
  '/meta/interest-finder',
  '/meta/live-chat',
  '/meta/subscribers',
  '/meta/growth-tools',
  '/meta/chat-broadcast',
  '/meta/chat-sequences',
] as const

type AllServicesUrl = (typeof servicesUrl)[number]

const servicesRecord: Record<AllServicesUrl, Service> = {
  '/meta/chatbot-flow-builder': {
    label: 'Chatbot Flow Builder',
    icon: 'bx-network-chart',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: true,
  },
  '/meta/comment-auto-reply': {
    label: 'Comment Auto Reply',
    icon: 'bx-conversation',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: true,
  },
  '/meta/post-randomizer': {
    label: 'Post Randomizer',
    icon: 'bx-message-dots',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: true,
  },
  '/meta/livestream': {
    label: 'Livestream',
    icon: 'bx-video',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/meta/interest-finder': {
    label: 'Interest Finder',
    icon: 'bx-file-find',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/meta/live-chat': {
    label: 'Live Chat',
    icon: 'bx-message-dots',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/meta/subscribers': {
    label: 'Subscribers',
    icon: 'bx-group',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/meta/growth-tools': {
    label: 'Growth Tools',
    icon: 'bx-chart',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/meta/chat-broadcast': {
    label: 'Chat Broadcast',
    icon: 'bx-broadcast',
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
    pinned: false,
  },
  '/meta/chat-sequences': {
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
  '/meta/messenger-webview',
  '/meta/persistent-menu',
  '/meta/welcome-message',
  '/meta/ice-breakers',
  '/meta/get-started',
  '/meta/keywords',
  '/meta/chatbot-defaults',
  '/meta/marketing-messages',
] as const

type AllUrl = (typeof urls)[number]

const routeRecords: Record<AllUrl, Omit<RouteRecordRaw, 'path'>> = {
  '/meta': {
    name: 'meta',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chatbot-flow-builder': {
    name: 'chatbot-flow-builder',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/ChatbotFlowBuilder.vue'),
  },
  '/meta/comment-auto-reply': {
    name: 'comment-auto-reply',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/post-randomizer': {
    name: 'post-randomizer',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/PostRandomizerPage.vue'),
  },
  '/meta/livestream': {
    name: 'livestream',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/interest-finder': {
    name: 'interest-finder',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/live-chat': {
    name: 'live-chat',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/subscribers': {
    name: 'subscribers',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/growth-tools': {
    name: 'growth-tools',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chat-broadcast': {
    name: 'chat-broadcast',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chat-sequences': {
    name: 'chat-sequences',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/messenger-webview': {
    name: 'messenger-webview',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/persistent-menu': {
    name: 'persistent-menu',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/welcome-message': {
    name: 'welcome-message',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/ice-breakers': {
    name: 'ice-breakers',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/get-started': {
    name: 'get-started',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/keywords': {
    name: 'keywords',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chatbot-defaults': {
    name: 'chatbot-defaults',
    meta: {
      requiresAuth: true,
    },
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/marketing-messages': {
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

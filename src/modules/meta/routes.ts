import type { RouteRecordRaw } from 'vue-router'

type AllServicesUrl = (typeof servicesUrl)[number]

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

const servicesFoo: Record<AllServicesUrl, Service> = {
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
    pinned: false,
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

export const servicesBaz = new Map(
  Object.entries(servicesFoo).map(([key, values]) => [key, values]),
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
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chatbot-flow-builder': {
    name: 'chatbot-flow-builder',
    component: () => import('./views/ChatbotFlowBuilder.vue'),
  },
  '/meta/comment-auto-reply': {
    name: 'comment-auto-reply',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/post-randomizer': {
    name: 'post-randomizer',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/livestream': {
    name: 'livestream',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/interest-finder': {
    name: 'interest-finder',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/live-chat': {
    name: 'live-chat',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/subscribers': {
    name: 'subscribers',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/growth-tools': {
    name: 'growth-tools',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chat-broadcast': {
    name: 'chat-broadcast',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chat-sequences': {
    name: 'chat-sequences',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/messenger-webview': {
    name: 'messenger-webview',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/persistent-menu': {
    name: 'persistent-menu',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/welcome-message': {
    name: 'welcome-message',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/ice-breakers': {
    name: 'ice-breakers',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/get-started': {
    name: 'get-started',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/keywords': {
    name: 'keywords',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chatbot-defaults': {
    name: 'chatbot-defaults',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/marketing-messages': {
    name: 'marketing-messages',
    component: () => import('./views/MetaHomePage.vue'),
  },
}

export const routes = Object.entries(routeRecords).map(([key, values]) => ({
  path: key,
  ...values,
}))

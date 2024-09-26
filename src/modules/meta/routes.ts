import type { RouteRecordRaw } from 'vue-router'

export const homeUrl = '/meta' as const

export const urls = [
  homeUrl,
  '/meta/chatbot-flow-builder',
  '/meta/comment-auto-reply',
  '/meta/import-social-media',
  '/meta/post-randomizer',
  '/meta/livestream',
  '/meta/interest-finder',
  '/meta/live-chat',
  '/meta/subscribers',
  '/meta/growth-tools',
  '/meta/chat-broadcast',
  '/meta/chat-sequences',
  '/meta/messenger-webview',
  '/meta/persistent-menu',
  '/meta/welcome-message',
  '/meta/ice-breakers',
  '/meta/get-started',
  '/meta/keywords',
  '/meta/chatbot-defaults',
  '/meta/marketing-messages',
] as const

const routesMap: Record<(typeof urls)[number], Omit<RouteRecordRaw, 'path'>> = {
  '/meta': {
    name: 'meta',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/chatbot-flow-builder': {
    name: 'chatbot-flow-builder',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/comment-auto-reply': {
    name: 'comment-auto-reply',
    component: () => import('./views/MetaHomePage.vue'),
  },
  '/meta/import-social-media': {
    name: 'import-social-media',
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

export const routes = Object.entries(routesMap).map(([key, values]) => ({
  path: key,
  ...values,
}))

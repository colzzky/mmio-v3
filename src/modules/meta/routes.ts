import type { RouteRecordRaw } from 'vue-router'

export const homeUrl = '/meta' as const

const urls = [
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

const routeRecords: Record<(typeof urls)[number], Omit<RouteRecordRaw, 'path'>> = {
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

export const routes = Object.entries(routeRecords).map(([key, values]) => ({
  path: key as (typeof urls)[number],
  ...values,
}))

const sidebarLinks: Record<(typeof urls)[number], { label: string; icon: string }> = {
  '/meta': {
    label: 'Home',
    icon: 'material-symbols:home-outline',
  },
  '/meta/chatbot-flow-builder': {
    label: 'Chatbot Flow Builder',
    icon: 'fluent-mdl2:flow',
  },
  '/meta/comment-auto-reply': {
    label: 'Comment Auto Reply',
    icon: 'mdi:comment-outline',
  },
  '/meta/import-social-media': {
    label: 'Import Social Media',
    icon: 'ph:plug',
  },
  '/meta/post-randomizer': {
    label: 'Post Randomizer',
    icon: 'lets-icons:sort-random-light',
  },
  '/meta/livestream': {
    label: 'Livestream',
    icon: 'mdi:video-outline',
  },
  '/meta/interest-finder': {
    label: 'Interest Finder',
    icon: 'icon-park-outline:find',
  },
  '/meta/live-chat': {
    label: 'Live Chat',
    icon: 'hugeicons:messenger',
  },
  '/meta/subscribers': {
    label: 'Subscribers',
    icon: 'ph:users',
  },
  '/meta/growth-tools': {
    label: 'Growth Tools',
    icon: 'ph:chart-line',
  },
  '/meta/chat-broadcast': {
    label: 'Chat Broadcast',
    icon: 'ph:broadcast',
  },
  '/meta/chat-sequences': {
    label: 'Chat Sequences',
    icon: 'formkit:fastforward',
  },
  '/meta/messenger-webview': {
    label: 'Messenger Webview',
    icon: 'ion:open-outline',
  },
  '/meta/persistent-menu': {
    label: 'Persistent Menu',
    icon: 'material-symbols-light:menu',
  },
  '/meta/welcome-message': {
    label: 'Welcome Message',
    icon: 'mingcute:open-door-line',
  },
  '/meta/ice-breakers': {
    label: 'Ice Breakers (FAQs)',
    icon: 'mdi:information-outline',
  },
  '/meta/get-started': {
    label: 'Get Started',
    icon: 'tabler:message',
  },
  '/meta/keywords': {
    label: 'Keywords',
    icon: 'codicon:symbol-keyword',
  },
  '/meta/chatbot-defaults': {
    label: 'Chatbot Defaults',
    icon: 'material-symbols-light:settings-outline',
  },
  '/meta/marketing-messages': {
    label: 'Marketing Messages',
    icon: 'uit:repeat',
  },
}

export const links = Object.entries(sidebarLinks).map(([key, values]) => ({
  href: key,
  ...values,
}))

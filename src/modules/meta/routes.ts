import type { RouteRecordRaw } from 'vue-router'

const platformName = 'meta'

const servicesName = [
  'chatbot-flow-builder',
  'comment-auto-reply',
  'post-randomizer',
  'livestream',
  'interest-finder',
  'live-chat',
  'subscribers',
  'growth-tools',
  'chat-broadcast',
  'chat-sequences',
  'ads-analytics',
] as const

const names = [
  platformName,
  ...servicesName,
  'messenger-webview',
  'persistent-menu',
  'welcome-message',
  'ice-breakers',
  'get-started',
  'keywords',
  'chatbot-defaults',
  'marketing-messages',
] as const

export type Service = { icon: string; label: string; pinned: boolean; description: string }
type ServiceRecord = Record<(typeof servicesName)[number], Service>
const servicesRecord: ServiceRecord = {
  'chatbot-flow-builder': {
    icon: 'bx-network-chart',
    label: 'Chatbot Flow Builder',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'comment-auto-reply': {
    icon: 'bx-conversation',
    label: 'Comment Auto Reply',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'post-randomizer': {
    icon: 'bx-shuffle',
    label: 'Post Randomizer',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  livestream: {
    icon: 'bx-video',
    label: 'Livestream',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'interest-finder': {
    icon: 'bx-file-find',
    label: 'Interest Finder',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'live-chat': {
    icon: 'bx-message-alt-dots',
    label: 'Live Chat',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  subscribers: {
    icon: 'bx-group',
    label: 'Subscribers',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'growth-tools': {
    icon: 'bx-chart',
    label: 'Growth Tools',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'chat-broadcast': {
    icon: 'bx-broadcast',
    label: 'Chat Broadcast',
    pinned: false,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'chat-sequences': {
    icon: 'bx-comment-add',
    label: 'Chat Sequences',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
  'ads-analytics': {
    icon: 'bx-bar-chart-alt',
    label: 'Ads Analytics',
    pinned: true,
    description:
      'lorem ipsum dolor sit amet consectetur adipiscing elit duis porta eros lacus nec ultricies elit blandit non suspendisse pellentesque mauris sit amet dolor blandit rutrum nunc in tempus turpis',
  },
}

export const services = new Map(
  Object.entries(servicesRecord).map(([key, values]) => [
    key,
    {
      ...values,
      name: `meta-${key}`,
    },
  ]),
)

type RouteRecord = Record<(typeof names)[number], Omit<RouteRecordRaw, 'path' | 'name'>>
const routeRecords: RouteRecord = {
  meta: {
    component: () => import('./services/dashboard/page.vue'),
  },
  'chatbot-flow-builder': {
    component: () => import('./services/chatbot-flow-builder/page.vue'),
  },
  'comment-auto-reply': {
    component: () => import('./services/comment-auto-reply/page.vue'),
  },
  'post-randomizer': {
    component: () => import('./services/post-randomizer/page.vue'),
  },
  livestream: {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'interest-finder': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'live-chat': {
    component: () => import('./services/live-chat/page.vue'),
  },
  subscribers: {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'growth-tools': {
    component: () => import('./services/growth-tools/page.vue'),
  },
  'chat-broadcast': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'chat-sequences': {
    component: () => import('./services/chat-sequence/page.vue'),
  },
  'ads-analytics': {
    component: () => import('./services/ads-analytics/page.vue'),
  },
  'messenger-webview': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'persistent-menu': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'welcome-message': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'ice-breakers': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'get-started': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  keywords: {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'chatbot-defaults': {
    component: () => import('./views/MetaHomePage.vue'),
  },
  'marketing-messages': {
    component: () => import('./views/MetaHomePage.vue'),
  },
}

const routes: RouteRecordRaw[] = Object.entries(routeRecords).map(([key, values]) => ({
  ...values,
  name: key === 'meta' ? 'meta' : `meta-${key}`,
  path: key,
})) as RouteRecordRaw[]

//Children here
const allRoutes = [...routes,
{
  name: 'post-randomizer-view',
  path: 'post-randomizer/:randomizer_id',
  component: () => import('./services/post-randomizer/view-post-randomizer.vue'),
},
{
  name: 'chatbot-flow',
  path: 'chatbot-flow-builder/flow',
  component: () => import('./services/chatbot-flow-builder/chatbot-flow-view.vue'),
},
{
  name: 'chatbot-flow-upload',
  path: 'chatbot-flow-builder/flow-upload',
  component: () => import('./services/chatbot-flow-builder/chatbot-flow-view.vue'),
},
{
  name: 'chatbot-flow-final',
  path: 'chatbot-flow-builder/:cb_id/flow-final',
  component: () => import('./services/chatbot-flow-builder/chatbot-flow-view.vue'),
},

]

export { allRoutes }

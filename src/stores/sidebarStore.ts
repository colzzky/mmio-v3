import type { urls as metaUrls } from '@/modules/meta/routes'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const metaNavigationRoutes: Record<(typeof metaUrls)[number], { label: string; icon: string }> = {
  '/meta': {
    label: 'Home',
    icon: 'material-symbols:home-outline',
  },
  '/meta/chatbot-flow-builder': {
    label: 'Chatbot Flow Builder',
    icon: 'material-symbols:home-outline',
  },
  '/meta/comment-auto-reply': {
    label: 'Comment Auto Reply',
    icon: 'material-symbols:home-outline',
  },
  '/meta/import-social-media': {
    label: 'Import Social Media',
    icon: 'material-symbols:home-outline',
  },
  '/meta/post-randomizer': {
    label: 'Post Randomizer',
    icon: 'material-symbols:home-outline',
  },
  '/meta/livestream': {
    label: 'Livestream',
    icon: 'material-symbols:home-outline',
  },
  '/meta/interest-finder': {
    label: 'Interest Finder',
    icon: 'material-symbols:home-outline',
  },
  '/meta/live-chat': {
    label: 'Live Chat',
    icon: 'material-symbols:home-outline',
  },
  '/meta/subscribers': {
    label: 'Subscribers',
    icon: 'material-symbols:home-outline',
  },
  '/meta/growth-tools': {
    label: 'Growth Tools',
    icon: 'material-symbols:home-outline',
  },
  '/meta/chat-broadcast': {
    label: 'Chat Broadcast',
    icon: 'material-symbols:home-outline',
  },
  '/meta/chat-sequences': {
    label: 'Chat Sequences',
    icon: 'material-symbols:home-outline',
  },
  '/meta/messenger-webview': {
    label: 'Messenger Webview',
    icon: 'material-symbols:home-outline',
  },
  '/meta/persistent-menu': {
    label: 'Persistent Menu',
    icon: 'material-symbols:home-outline',
  },
  '/meta/welcome-message': {
    label: 'Welcome Message',
    icon: 'material-symbols:home-outline',
  },
  '/meta/ice-breakers': {
    label: 'Ice Breakers',
    icon: 'material-symbols:home-outline',
  },
  '/meta/get-started': {
    label: 'Get Started',
    icon: 'material-symbols:home-outline',
  },
  '/meta/keywords': {
    label: 'Keywords',
    icon: 'material-symbols:home-outline',
  },
  '/meta/chatbot-defaults': {
    label: 'Chatbot Defaults',
    icon: 'material-symbols:home-outline',
  },
  '/meta/marketing-messages': {
    label: 'Marketing Messages',
    icon: 'material-symbols:home-outline',
  },
}

export const useSidebarStore = defineStore('sidebar', () => {
  // TOGGLE MOBILE SIDEBAR
  const isMobileSidebarOpen = ref(false)
  function toggleMobileSidebarOn() {
    isMobileSidebarOpen.value = true
  }
  function toggleMobileSidebarOff() {
    isMobileSidebarOpen.value = false
  }

  // LOGOUT USER
  const router = useRouter()
  function logoutUser() {
    router.push('/login')
  }

  // GET SERVICE ROUTES
  const routes = ref({
    meta: Object.entries(metaNavigationRoutes).map(([key, values]) => ({ href: key, ...values })),
  })

  function getServiceRoutes(routePath: string) {
    if (routePath.includes('meta')) return routes.value.meta

    throw new Error('Service not found')
  }

  return {
    isMobileSidebarOpen,
    toggleMobileSidebarOn,
    toggleMobileSidebarOff,
    logoutUser,
    routes,
    getServiceRoutes,
  }
})

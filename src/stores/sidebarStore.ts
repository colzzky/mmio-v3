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

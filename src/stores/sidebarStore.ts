import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const routes = ref({
    meta: [
      {
        href: '/meta',
        name: 'Home',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/chatbot-flow-builder',
        name: 'Chatbot Flow Builder',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/comment-auto-reply',
        name: 'Comment Auto Reply',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/import-social-media',
        name: 'Import Social Media',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/post-randomizer',
        name: 'Post Randomizer',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/livestream',
        name: 'Livestream',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/interest-finder',
        name: 'Interest Finder',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/live-chat',
        name: 'Live Chat',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/subscribers',
        name: 'Subscribers',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/growth-tools',
        name: 'Growth Tools',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/chat-broadcast',
        name: 'Chat Broadcast',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/chat-sequences',
        name: 'Chat Sequences',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/messenger-webview',
        name: 'Messenger Webview',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/persistent-menu',
        name: 'Persistent Menu',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/welcome-message',
        name: 'Welcome Message',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/ice-breakers',
        name: 'Ice Breakers',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/get-started',
        name: 'Get Started',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/keywords',
        name: 'Keywords',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/chatbot-defaults',
        name: 'Chatbot Defaults',
        icon: 'material-symbols:home-outline',
      },
      {
        href: '/marketing-messages',
        name: 'Marketing Messages',
        icon: 'material-symbols:home-outline',
      },
    ],
  })

  function getServiceRoutes(service: keyof typeof routes.value) {
    return routes.value[service]
  }

  return { routes, getServiceRoutes }
})

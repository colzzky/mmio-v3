import { homeUrl as metaHomeUrl } from '@/modules/meta/routes'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const servicesHomeUrls = [
  metaHomeUrl,
  '/omni-channel',
  '/e-commerce',
  '/web-chat-widget',
  '/email-marketing',
  '/sms-marketing',
  '/google-my-business',
  '/whats-app',
] as const

const serviceRoutes: Record<
  (typeof servicesHomeUrls)[number],
  { icon: string; name: string; description: string }
> = {
  '/meta': {
    icon: 'mingcute:meta-fill',
    name: 'Meta',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/omni-channel': {
    icon: 'material-symbols:globe-asia',
    name: 'Omni-channel',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/e-commerce': {
    icon: 'mdi:cart-outline',
    name: 'E-Commerce',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/web-chat-widget': {
    icon: 'tabler:code',
    name: 'Web Chat Widget',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/email-marketing': {
    icon: 'ic:outline-email',
    name: 'E-mail Marketing',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/sms-marketing': {
    icon: 'bi:phone',
    name: 'SMS Marketing',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/google-my-business': {
    icon: 'mdi:google',
    name: 'Google My Business',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
  '/whats-app': {
    icon: 'ic:baseline-whatsapp',
    name: 'WhatsApp',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
  },
}

export const useServicesStore = defineStore('services', () => {
  const services = ref(
    Object.entries(serviceRoutes).map(([key, value]) => ({
      href: key,
      ...value,
    })),
  )

  return { services }
})

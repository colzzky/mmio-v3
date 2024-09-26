import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServicesStore = defineStore('services', () => {
  const services = ref([
    {
      href: '/meta',
      icon: 'mingcute:meta-fill',
      name: 'Meta',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'material-symbols:globe-asia',
      name: 'Omni-channel',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'mdi:cart-outline',
      name: 'E-Commerce',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'tabler:code',
      name: 'Web Chat Widget',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'ic:outline-email',
      name: 'E-mail Marketing',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'bi:phone',
      name: 'SMS Marketing',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'mdi:google',
      name: 'Google My Business',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'ic:baseline-whatsapp',
      name: 'WhatsApp',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
  ])

  return { services }
})

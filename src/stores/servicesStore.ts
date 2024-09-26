import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServicesStore = defineStore('services', () => {
  const services = ref([
    {
      href: '/meta',
      icon: 'mingcute:meta-fill',
      title: 'Meta',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'material-symbols:globe-asia',
      title: 'Omni-channel',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'mdi:cart-outline',
      title: 'E-Commerce',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'tabler:code',
      title: 'Web Chat Widget',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'ic:outline-email',
      title: 'E-mail Marketing',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'bi:phone',
      title: 'SMS Marketing',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'mdi:google',
      title: 'Google My Business',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
    {
      href: '#',
      icon: 'ic:baseline-whatsapp',
      title: 'WhatsApp',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porta eros lacus, nec ultricies elit blandit non. Suspendisse pellentesque mauris sit amet dolor blandit rutrum. Nunc in tempus turpis.',
    },
  ])

  return { services }
})

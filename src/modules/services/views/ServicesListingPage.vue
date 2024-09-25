<script setup lang="ts">
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Icon } from '@iconify/vue'

const services = [
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
]
</script>

<template>
  <DefaultLayout>
    <main class="grid gap-4 p-8 sm:grid-cols-2 2xl:grid-cols-3">
      <RouterLink v-for="service in services" :key="service.href" :to="service.href">
        <Card class="transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-x-2 whitespace-nowrap">
              <Icon :icon="service.icon" class="size-8" />
              {{ service.title }}
            </CardTitle>
            <CardDescription>
              {{ service.description }}
            </CardDescription>
          </CardHeader>
        </Card>
      </RouterLink>
    </main>
  </DefaultLayout>
</template>

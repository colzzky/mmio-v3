<script lang="ts" setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog'

const platforms = [
  {
    name: 'Meta',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bxl-meta',
  },
  {
    name: 'Email Marketing',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bx-envelope',
  },
  {
    name: 'Google My Business',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bxl-google',
  },
  {
    name: 'Whatsapp',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bxl-whatsapp',
  },
  {
    name: 'SMS Marketing',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bx-message-rounded',
  },
  {
    name: 'E-Commerce',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bx-shopping-bag',
  },
  {
    name: 'OmniChannel',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis cursus urna, ',
    href: '#',
    icon: 'bx-group',
  },
]
</script>
<template>
  <div>
    <Dialog>
      <DialogTrigger>
        <button class="flex items-center gap-x-1">
          <i class="material-icons text-sm">grain</i>
          <span class="text-xs font-medium">New</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-xl font-bold"
            >Select a new Campaign for your Platform</DialogTitle
          >
          <DialogDescription> Choose a platform you want to use MMIO </DialogDescription>
          <div
            v-for="platform in platforms"
            :key="platform.name"
            class="transition-duration: 150ms; group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 transition-all hover:bg-gray-200"
          >
            <i class="bx text-2xl" :class="platform.icon"></i>
            <div class="flex flex-col gap-y-0">
              <span class="font-semibold">{{ platform.name }}</span>
              <span class="text text-xs font-medium text-gray-700">Test Description</span>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </div>
</template>

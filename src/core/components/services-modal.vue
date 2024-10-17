<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/core/components/ui/dialog'
import { useServicesStore } from '@/stores/servicesStore'
import { useRoute } from 'vue-router'

const servicesStore = useServicesStore()
const route = useRoute()
const services = servicesStore.getServiceLinks(route.path)

const pj_id = route.params.pj_id
</script>

<template>
  <Dialog>
    <DialogContent class="pb-2">
      <DialogHeader>
        <DialogTitle>Choose a service</DialogTitle>
        <DialogDescription>What we offer!</DialogDescription>
      </DialogHeader>
      <ul class="-mx-4 flex max-h-[50svh] flex-col overflow-y-scroll">
        <li
          v-for="[name, service] in services"
          :key="name"
          class="grid grid-cols-[1fr_var(--bookmark-size)] gap-x-2 rounded p-4 [--bookmark-size:48px] [&:has(a:hover)]:bg-primary/5"
        >
          <RouterLink
            :to="{ name, params: { pj_id } }"
            class="grid grid-cols-[var(--icon-size)_1fr] gap-x-4 [--icon-size:36px]"
          >
            <div
              class="row-span-2 grid size-[var(--icon-size)] place-content-center self-center rounded-full bg-black text-white"
            >
              <i :class="['bx text-xl', service.icon]" />
            </div>
            <h3 class="text-sm font-bold">{{ service.label }}</h3>
            <p class="text-xs">{{ service.description }}</p>
          </RouterLink>
          <button
            class="size-[var(--bookmark-size)] self-center rounded-full leading-none hover:bg-primary/5"
            @click="servicesStore.toggleServicePinnedStatus(route.path, name)"
          >
            <i class="material-icons">
              {{ service.pinned ? 'bookmark' : 'bookmark_outline' }}
            </i>
          </button>
        </li>
      </ul>
    </DialogContent>
  </Dialog>
</template>

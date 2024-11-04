<script setup lang="ts">
import type { Modal } from '../utils/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/core/components/ui/dialog'
import { useServicesStore } from '@/stores/servicesStore'
import { reactive } from 'vue'

const modal = reactive<Modal>({
  isOpen: false,
  initialState() {
    this.isOpen = false
  },
  open() {
    this.isOpen = true
  },
  close() {
    this.initialState()
  },
})

const serviceStore = useServicesStore()

defineExpose({ modal })
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="pb-2">
      <DialogHeader>
        <DialogTitle>Choose a service</DialogTitle>
        <DialogDescription>What we offer!</DialogDescription>
      </DialogHeader>
      <ul class="-mx-4 flex max-h-[50svh] flex-col overflow-y-scroll">
        <li
          v-for="[serviceName, service] in serviceStore.platformServices"
          :key="serviceName"
          class="grid grid-cols-[1fr_var(--bookmark-size)] gap-x-2 rounded p-4 [--bookmark-size:48px] [&:has(a:hover)]:bg-primary/5"
        >
          <RouterLink
            :to="{ name: serviceName }"
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
            @click="serviceStore.toggleServicePinnedStatus(serviceName)"
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

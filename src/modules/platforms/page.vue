<script setup lang="ts">
import { Card } from '@/core/components/ui/card'
import Main from '@/core/components/ui/main.vue'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { useServicesStore } from '@/stores/servicesStore'

const servicesStore = useServicesStore()
</script>

<template>
  <Main class="grid gap-y-4">
    <template #heading>Platforms & Services</template>
    <Card
      class="grid max-w-screen-xl grid-cols-[var(--image-size)_1fr] grid-rows-[max-content,1fr] gap-8 justify-self-center bg-primary/5 p-8 [--image-size:400px] [--service-color:#1877F2]"
    >
      <div
        class="grid grid-cols-[var(--icon-size)_1fr] gap-x-2 text-[var(--service-color)] [--icon-size:28px]"
      >
        <i class="bx bxl-meta row-span-2 text-[length:var(--icon-size)] leading-none" />
        <h2 class="text-[length:var(--icon-size)] font-bold leading-none">Meta</h2>
        <p class="text-xs text-muted-foreground">Create a chatbot for your FB or group page</p>
      </div>
      <img
        src="@/assets/undraw_uploading_re_okvh.svg"
        alt=""
        class="row-start-2 size-[var(--image-size)] justify-self-end"
      />
      <ScrollArea as="ul" class="row-span-2 max-h-[500px] [&>div>div]:grid [&>div>div]:gap-y-4">
        <li
          v-for="[serviceName, service] in servicesStore.services.get('meta')"
          :key="serviceName"
          class="grid grid-cols-[var(--icon-size)_1fr_24px_24px] gap-x-4 [--icon-size:32px]"
        >
          <div
            class="grid size-[var(--icon-size)] place-content-center self-center rounded-full bg-black leading-none text-white"
          >
            <i :class="['bx text-xl', service.icon]" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-[var(--service-color)]">{{ service.label }}</h3>
            <p class="text-xs">{{ service.description }}</p>
          </div>
          <button
            type="button"
            @click="servicesStore.toggleServicePinnedStatus(serviceName)"
            class="self-center leading-none"
          >
            <i class="material-icons text-xl">
              {{ service.pinned ? 'bookmark' : 'bookmark_outline' }}
            </i>
          </button>
          <button type="button" class="self-center leading-none">
            <i class="bx bx-dots-vertical-rounded text-xl" />
          </button>
        </li>
      </ScrollArea>
    </Card>
  </Main>
</template>

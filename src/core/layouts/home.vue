<script setup lang="ts">
import ServicesModal from '../components/services-modal.vue'
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/core/components/ui/collapsible'
import { useServicesStore } from '@/stores/servicesStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHomepage = computed(() => route.name === 'home')

const homepageNavigations = [
  {
    icon: 'grid_view',
    label: 'All Campaigns',
    href: '/',
  },
  {
    icon: 'history',
    label: 'Recent',
    href: '/recent',
  },
]

const sidebarStore = useSidebarStore()
const servicesStore = useServicesStore()

const servicesModalRef = useTemplateRef('servicesModal')
</script>

<template>
  <DesktopSidebar>
    <template v-if="isHomepage">
      <li>
        <ul role="list" class="-mx-2">
          <li v-for="item in homepageNavigations" :key="item.href">
            <RouterLink
              :to="item.href"
              class="group flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold hover:bg-primary/5 aria-[current=page]:bg-primary/10 aria-[current=page]:font-bold"
            >
              <i class="material-icons text-xl">{{ item.icon }}</i>
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </li>
    </template>
    <template v-else>
      <li>
        <h1 class="text-xs font-bold uppercase text-primary/75">
          {{ sidebarStore.platformHeading }}
        </h1>
      </li>

      <!-- navigation routes -->
      <li>
        <ul role="list" class="-mx-2">
          <div class="flex flex-col gap-y-1">
            <li>
              <RouterLink
                :to="{ name: sidebarStore.platformName }"
                class="group flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
              >
                <i class="material-icons text-xl">grid_view</i>
                Dashboard
              </RouterLink>
            </li>

            <li>
              <button
                class="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold hover:bg-primary/25"
                @click="servicesModalRef?.modal.open()"
              >
                <i class="material-icons text-xl">bookmark_border</i>
                Manage Services
              </button>
            </li>
          </div>
        </ul>
      </li>

      <Collapsible class="flex flex-col gap-y-1" :open="servicesStore.pinnedServices.length > 0">
        <CollapsibleTrigger
          class="group flex w-full items-center justify-between text-xs font-bold uppercase text-primary/75"
        >
          Pinned Services
          <i class="material-icons text-2xl transition-transform group-aria-expanded:rotate-180">
            arrow_drop_down
          </i>
        </CollapsibleTrigger>
        <CollapsibleContent as="ul" class="-mx-2">
          <div class="flex flex-col gap-y-1">
            <li v-for="[name, service] in servicesStore.pinnedServices" :key="name">
              <RouterLink
                :to="{ name }"
                class="grid grid-cols-[20px_1fr_20px] items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
              >
                <i :class="['bx text-xl', service.icon]"></i>
                <span>
                  {{ service.label }}
                </span>
                <button
                  class="grid place-content-center"
                  @click.prevent="servicesStore.toggleServicePinnedStatus(name)"
                >
                  <i class="material-icons text-xl">bookmark</i>
                </button>
              </RouterLink>
            </li>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ServicesModal ref="servicesModal" />
    </template>
  </DesktopSidebar>
  <div class="lg:pl-72">
    <RouterView />
  </div>
</template>

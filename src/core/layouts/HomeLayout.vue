<script setup lang="ts">
import MobileSidebar from '../components/Sidebar/mobile-sidebar.vue'
import DesktopSidebar from '../components/Sidebar/desktop-sidebar.vue'
import { useSidebarStore } from '@/stores/sidebarStore'
import ProjectCenter from '@/modules/try/components/ProjectCenter.vue'
import { Bars3Icon } from '@heroicons/vue/24/outline';

const sidebarStore = useSidebarStore()

const navigation = [
  { name: 'All Campaigns', href: '#', icon: 'grid_view', current: true },
  { name: 'Recents', href: '#', icon: 'history', current: false },
]
</script>

<template>
  <div>
    <MobileSidebar />

    <DesktopSidebar>
      <li>
        <ul role="list" class="-mx-2 space-y-1">
          <li v-for="item in navigation" :key="item.name">
            <RouterLink
              :to="item.href"
              class="group flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold hover:bg-primary/5"
            >
              <i class="material-icons text-2xl">{{ item.icon }}</i>
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
      </li>
    </DesktopSidebar>

    <div class="lg:pl-72">
      <div
        class="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          @click="sidebarStore.toggleMobileSidebar('on')"
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true"></div>

        <div class="flex flex-1 justify-end">
          <span class="isolate inline-flex rounded-md">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <i class="material-icons text-md">search</i>
              </div>
              <input
                class="block h-9 w-full rounded-l-md border-0 py-1 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
                placeholder="Search Campaigns"
              />
            </div>
            <div
              class="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            >
              <ProjectCenter />
            </div>
          </span>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>

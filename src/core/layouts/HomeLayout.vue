<script setup lang="ts">
import DesktopSidebar from '../components/sidebar/desktop-sidebar.vue'
// import MobileSidebar from '../components/sidebar/mobile-sidebar.vue'
import { Toaster } from '@/core/components/ui/toast'
import ProjectCenter from '@/modules/try/components/ProjectCenter.vue'
import { useAuthStore } from '@/stores/authStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const useAuth = useAuthStore()
const { user_auth, page_init } = useAuth
const layoutLoad = ref<boolean>(false)

const sidebarStore = useSidebarStore()

const navigation = [
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
</script>

<template>
  <Toaster />
  <div v-if="!layoutLoad && page_init.initialize">
    <!-- <MobileSidebar /> -->

    <DesktopSidebar>
      <li>
        <ul role="list" class="-mx-2">
          <li v-for="item in navigation" :key="item.href">
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
  <div v-else class="flex h-screen flex-col items-center justify-center bg-gray-100">
    <div class="flex animate-pulse items-center gap-x-1">
      <i class="material-icons text-4xl">pin</i>
      <span class="text-xl font-extrabold">MMIO</span>
    </div>
    <div class="flex items-center justify-center space-x-2">
      <i class="material-icons animate-spin text-sm">donut_large</i>
      <div>Loading</div>
    </div>
  </div>
</template>

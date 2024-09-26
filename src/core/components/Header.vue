<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebarStore'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Icon } from '@iconify/vue'

const sidebarStore = useSidebarStore()

withDefaults(defineProps<{ showSidebarButton?: boolean; showServicesButton?: boolean }>(), {
  showServicesButton: true,
  showSidebarButton: true,
})
</script>

<template>
  <header
    class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
  >
    <template v-if="showSidebarButton">
      <button
        type="button"
        class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        @click="sidebarStore.toggleMobileSidebarOn"
      >
        <span class="sr-only">Open sidebar</span>
        <Icon icon="material-symbols:menu" class="size-6" />
      </button>

      <!-- Separator -->
      <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />
    </template>

    <div class="flex flex-1 justify-end gap-x-4 lg:gap-x-6">
      <div class="flex items-center gap-x-4 lg:gap-x-6">
        <template v-if="showServicesButton">
          <button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <span class="sr-only">View notifications</span>
            <Icon icon="mingcute:dot-grid-fill" class="size-6" />
          </button>

          <!-- Separator -->
          <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />
        </template>

        <!-- Profile Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center">
            <span class="sr-only">Open user menu</span>
            <Avatar class="size-8">
              <AvatarImage
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              >
                <AvatarFallback>TC</AvatarFallback>
              </AvatarImage>
            </Avatar>
            <span class="hidden lg:flex lg:items-center">
              <span class="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true"
                >Tom Cook</span
              >
              <ChevronDownIcon class="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="sidebarStore.logoutUser">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover'
import { useServicesStore } from '@/stores/servicesStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { Icon } from '@iconify/vue'

const sidebarStore = useSidebarStore()
const servicesStore = useServicesStore()

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
        @click="sidebarStore.toggleMobileSidebar('on')"
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
          <Popover>
            <PopoverTrigger class="-m-2.5 p-2.5 text-primary/50 hover:text-primary/75">
              <span class="sr-only">View notifications</span>
              <Icon icon="mingcute:dot-grid-fill" class="size-6" />
            </PopoverTrigger>
            <PopoverContent class="grid w-80 grid-cols-3 gap-2">
              <RouterLink
                v-for="service in servicesStore.services"
                :key="service.name"
                :to="service.href"
                class="group flex flex-col items-center gap-y-2 rounded-lg p-2 text-center text-[0.6rem] font-medium hover:bg-primary-foreground"
              >
                <span
                  class="inline-flex rounded-lg bg-primary-foreground p-3 text-primary group-hover:bg-transparent"
                >
                  <Icon :icon="service.icon" class="size-8 shrink-0" aria-hidden="true" />
                </span>
                {{ service.name }}
              </RouterLink>
            </PopoverContent>
          </Popover>

          <!-- Separator -->
          <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true" />
        </template>

        <!-- Profile Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger class="group flex items-center">
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
              <Icon
                icon="ep:arrow-down-bold"
                class="ml-2 size-4 text-primary/50 group-hover:text-primary/75"
                aria-hidden="true"
              />
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

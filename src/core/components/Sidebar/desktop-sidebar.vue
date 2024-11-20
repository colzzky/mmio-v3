<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/core/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Separator } from '@/core/components/ui/separator'
import { useServicesStore } from '@/stores/servicesStore'

const servicesStore = useServicesStore()
</script>

<template>
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <div class="flex grow flex-col overflow-y-auto border-r border-gray-300">
      <DropdownMenu>
        <DropdownMenuTrigger class="flex h-16 items-center gap-x-2 p-2">
          <i class="material-icons text-5xl">pin</i>
          <span
            class="overflow-hidden text-ellipsis whitespace-nowrap text-start font-bold leading-none"
            >Sample Workspace Name</span
          >
          <i class="material-icons">arrow_drop_down</i>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem class="font-bold">Sample Workspace Name</DropdownMenuItem>
          <DropdownMenuItem>Edgelord Workspace</DropdownMenuItem>
          <DropdownMenuItem>MMIO Workspace</DropdownMenuItem>
          <DropdownMenuItem>Accenture Workspace</DropdownMenuItem>
          <DropdownMenuItem>Flowers and Flower Co.</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator />

      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col">
          <li>
            <ul role="list" class="-mx-2 flex flex-col gap-y-1 p-4">
              <li>
                <RouterLink
                  :to="{ name: 'meta' }"
                  class="flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  <i class="material-icons text-xl">grid_view</i>
                  Dashboard
                </RouterLink>
              </li>

              <!-- <li>
                <RouterLink
                  to="#"
                  class="flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  <i class="material-icons text-xl">analytics</i>
                  Analytics
                </RouterLink>
              </li> -->

              <li>
                <RouterLink
                  :to="{ name: 'all-platforms' }"
                  class="flex items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  <i class="material-icons text-xl">bookmark_border</i>
                  All Platforms & Services
                </RouterLink>
              </li>
            </ul>
          </li>

          <Separator />

          <Collapsible class="flex flex-col p-2 text-xs" default-open>
            <CollapsibleTrigger
              class="group flex w-full items-center justify-between px-3 font-bold uppercase text-primary/75"
            >
              Pinned Services
              <i
                class="material-icons text-2xl transition-transform group-aria-expanded:rotate-180"
              >
                arrow_drop_down
              </i>
            </CollapsibleTrigger>
            <CollapsibleContent
              as="ul"
              class="flex flex-col gap-y-1 rounded bg-primary/5 p-2 empty:hidden"
            >
              <li v-for="[name, service] in servicesStore.pinnedServices" :key="name">
                <RouterLink
                  :to="{ name }"
                  class="grid grid-cols-[20px_1fr_20px] items-center gap-x-3 rounded-md px-2 py-1 font-semibold leading-6 transition-colors hover:bg-primary/25 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
                >
                  <i :class="['bx text-lg', service.icon]"></i>
                  <span>
                    {{ service.label }}
                  </span>
                  <button
                    class="grid place-content-center"
                    @click.prevent="servicesStore.toggleServicePinnedStatus(name)"
                  >
                    <i class="material-icons text-lg">bookmark</i>
                  </button>
                </RouterLink>
              </li>
            </CollapsibleContent>
          </Collapsible>

          <li class="mt-auto p-2 text-xs">
            <ul role="list" class="flex flex-col gap-y-1 rounded bg-primary/5 p-1.5">
              <div class="flex items-center justify-between px-2 py-1.5">
                <span class="font-medium">Paul's Team</span>
                <RouterLink to="#" class="font-bold text-blue-500"> Manage Team </RouterLink>
              </div>
              <li>
                <RouterLink
                  :to="{ name: 'workspace-settings-general' }"
                  class="flex items-center gap-x-3 rounded-md px-2 py-0.5 font-semibold leading-6 transition-colors hover:bg-primary/25"
                >
                  <i class="material-icons text-sm">settings</i>
                  Project Settings
                </RouterLink>
              </li>

              <li>
                <RouterLink
                  :to="{ name: 'workspace-settings-languages' }"
                  class="flex items-center gap-x-3 rounded-md px-2 py-0.5 font-semibold leading-6 transition-colors hover:bg-primary/25"
                >
                  <i class="material-icons text-sm">language</i>
                  Language
                </RouterLink>
              </li>

              <li>
                <RouterLink
                  to="/"
                  class="flex items-center gap-x-3 rounded-md px-2 py-0.5 font-semibold leading-6 transition-colors hover:bg-primary/25"
                >
                  <i class="material-icons text-sm">keyboard_return</i>
                  Return Home
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

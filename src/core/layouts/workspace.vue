<script setup lang="ts">
import ServicesModal from '@/core/components/services-modal.vue'
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Button } from '@/core/components/ui/button'
import { Card } from '@/core/components/ui/card'
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
    <header class="p-4">
      <Card class="flex items-center gap-x-2 bg-primary/5 px-4 py-2">
        <div class="flex grow flex-col gap-y-1">
          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center self-start text-xs/4 font-bold">
              Marketing Master IO Page
              <i class="material-icons">arrow_drop_down</i>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Item #1</DropdownMenuItem>
              <DropdownMenuItem>Item #2</DropdownMenuItem>
              <DropdownMenuItem>Item #3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <!-- <Breadcrumb>
              <BreadcrumbList class="text-xs/4">
                <BreadcrumbItem v-for="breadcrumb in breadcrumbs" :key="breadcrumb">
                  <BreadcrumbLink v-if="breadcrumb !== route.name" as-child>
                    <RouterLink :to="{ name: breadcrumb }">
                      {{ uiHelpers.toTitleCase(breadcrumb) }}
                    </RouterLink>
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else>
                    {{ uiHelpers.toTitleCase(breadcrumb) }}
                  </BreadcrumbPage>
                  <BreadcrumbSeparator v-if="breadcrumb !== breadcrumbs[breadcrumbs.length - 1]" />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> -->
        </div>
        <Button variant="ghost" size="xs">
          <i class="material-icons text-md">keyboard_return</i>
        </Button>
        <Button variant="ghost" size="xs">
          <i class="material-icons text-md">notifications</i>
        </Button>
        <Avatar>
          <AvatarImage src="https://placehold.co/48" />
          <AvatarFallback>UI</AvatarFallback>
        </Avatar>
      </Card>
    </header>

    <RouterView />
  </div>
</template>

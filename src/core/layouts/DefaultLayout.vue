<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useSidebarStore } from '@/stores/sidebarStore'
import Header from '../components/Header.vue'
import { Icon } from '@iconify/vue'
import SidebarRouteLink from '../components/SidebarRouteLink.vue'
import { useRoute } from 'vue-router'

// TOGGLE MOBILE SIDEBAR
const sidebarStore = useSidebarStore()
const route = useRoute()
const links = sidebarStore.getServiceLinks(route.path)
</script>
<template>
  <div>
    <TransitionRoot as="template" :show="sidebarStore.isMobileSidebarOpen">
      <Dialog class="relative z-50 lg:hidden" @close="sidebarStore.toggleMobileSidebar('off')">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild
                as="template"
                enter="ease-in-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in-out duration-300"
                leave-from="opacity-100"
                leave-to="opacity-0"
              >
                <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    class="-m-2.5 p-2.5"
                    @click="sidebarStore.toggleMobileSidebar('off')"
                  >
                    <span class="sr-only">Close sidebar</span>
                    <Icon icon="iconoir:xmark" class="size-6 text-background" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Sidebar component, swap this element with another sidebar if you like -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
                <div class="flex h-16 shrink-0 items-center">
                  <img
                    class="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=white"
                    alt="Your Company"
                  />
                </div>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="link in links" :key="link.label">
                          <SidebarRouteLink :to="link.href">
                            <Icon :icon="link.icon" class="size-6 shrink-0" aria-hidden="true" />
                            {{ link.label }}
                          </SidebarRouteLink>
                        </li>
                      </ul>
                    </li>
                    <li class="mt-auto">
                      <SidebarRouteLink to="/settings" class-name="-mx-3 px-3">
                        <Icon
                          icon="material-symbols:settings-outline"
                          class="size-6 shrink-0"
                          aria-hidden="true"
                        />
                        Settings
                      </SidebarRouteLink>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Static sidebar for desktop -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
          <img
            class="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=white"
            alt="Your Company"
          />
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="route in links" :key="route.label">
                  <SidebarRouteLink :to="route.href">
                    <Icon :icon="route.icon" class="size-6 shrink-0" aria-hidden="true" />
                    {{ route.label }}
                  </SidebarRouteLink>
                </li>
              </ul>
            </li>
            <li class="mt-auto">
              <SidebarRouteLink to="/settings" class-name="-mx-3 px-3">
                <Icon
                  icon="material-symbols:settings-outline"
                  class="size-6 shrink-0"
                  aria-hidden="true"
                />
                Settings
              </SidebarRouteLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="lg:pl-72">
      <Header />

      <main class="py-10">
        <div class="px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

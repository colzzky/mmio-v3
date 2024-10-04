<template>
  <div>
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/80"></div>
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
                  <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                    <span class="sr-only">Close sidebar</span>
                    <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              <!-- Sidebar component, swap this element with another sidebar if you like -->
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
                <div class="flex h-16 shrink-0 items-center">
                  <img
                    class="h-8 w-auto"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=white"
                    alt="Your Company"
                  />
                </div>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.name">
                          <a
                            :href="item.href"
                            :class="[
                              item.current
                                ? 'bg-indigo-700 text-white'
                                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            ]"
                          >
                            <component
                              :is="item.icon"
                              :class="[
                                item.current
                                  ? 'text-white'
                                  : 'text-indigo-200 group-hover:text-white',
                                'h-6 w-6 shrink-0',
                              ]"
                              aria-hidden="true"
                            />
                            {{ item.name }}
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <div class="text-xs font-semibold leading-6 text-indigo-200">
                        Pinned Services
                      </div>
                      <ul role="list" class="-mx-2 mt-2 space-y-1">
                        <li v-for="team in teams" :key="team.name">
                          <a
                            :href="team.href"
                            :class="[
                              team.current
                                ? 'bg-indigo-700 text-white'
                                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            ]"
                          >
                            <span
                              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white"
                              >{{ team.initial }}</span
                            >
                            <span class="truncate">{{ team.name }}</span>
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="mt-auto">
                      <a
                        href="#"
                        class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                      >
                        <Cog6ToothIcon
                          class="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
                          aria-hidden="true"
                        />
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div
        class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-300 px-6 pb-4 pt-8"
      >
        <div class="flex shrink-0 items-center">
          <div class="flex items-center gap-x-1 rounded-md p-2 text-sm leading-6 hover:bg-gray-100">
            <i class="material-icons text-4xl" alt="Your Company">pin</i>
            <span class="text-xl font-extrabold">MMIO</span>
            <i class="material-icons text-md">arrow_drop_down</i>
          </div>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.name">
                  <a
                    :href="item.href"
                    class="group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                  >
                    <i class="material-icons text-2xl">{{ item.icon }}</i>
                    {{ item.name }}
                  </a>
                </li>
              </ul>
            </li>
            <li class="mt-auto">
              <div class="grid gap-1">
                <a
                  href="#"
                  class="group -mx-2 flex items-center justify-start gap-x-3 rounded-md px-2 text-xs font-semibold leading-6 hover:bg-gray-100"
                >
                  <i class="material-icons text-sm">loyalty</i>
                  Plan & subscription
                  <span class="ltr ml-auto">Tier 4</span>
                </a>
                <a
                  href="#"
                  class="group -mx-2 flex items-center gap-x-3 rounded-md px-2 text-xs font-semibold leading-6 hover:bg-gray-100"
                >
                  <i class="material-icons text-sm">language</i>
                  Languages
                </a>
                <a
                  href="#"
                  class="group -mx-2 flex items-center gap-x-3 rounded-md px-2 text-xs font-semibold leading-6 hover:bg-gray-100"
                >
                  <i class="material-icons text-sm">cloud_sync</i>
                  Account Import
                </a>
                <a
                  href="#"
                  class="group -mx-2 flex items-center gap-x-3 rounded-md px-2 text-xs font-semibold leading-6 hover:bg-gray-100"
                >
                  <i class="material-icons text-sm">api</i>
                  API Integration
                </a>
                <a
                  href="#"
                  class="group -mx-2 flex items-center gap-x-3 rounded-md px-2 text-xs font-semibold leading-6 hover:bg-gray-100"
                >
                  <i class="material-icons text-sm">settings</i>
                  Settings
                </a>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="lg:pl-72">
      <div
        class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          @click="sidebarOpen = true"
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
              <CommandCenter />
            </div>
          </span>
        </div>

        <div></div>
      </div>

      <main class="py-2">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="w-full px-2 py-2">
            <div class="rounded-xl px-2 py-2">
              <div class="grid grid-cols-12 items-center">
                <div class="col-span-5 text-xs font-light">Name</div>
                <div class="col-span-2 text-xs font-light">Created</div>
                <div class="col-span-2 text-xs font-light">Updated</div>
                <div class="col-span-1 text-xs font-light">Status</div>
                <div class="col-span-1 text-xs font-light">Last Updated</div>
                <div class="col-span-1 text-xs font-light"></div>
              </div>
            </div>

            <div
              v-for="campaign in campaigns"
              :key="campaign.name"
              class="rounded-xl px-2 py-2 transition-all duration-100 hover:bg-gray-300"
            >
              <div class="grid grid-cols-12 items-center">
                <div class="col-span-5">
                  <div class="flex items-center gap-x-3">
                    <i class="bx text-2xl" :class="find_icon(campaign.platform)"></i>
                    <div class="grid gap-0">
                      <span class="text-sm">{{ campaign.name }}</span>
                      <span class="text-xs">{{ campaign.account }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-span-2 text-sm text-gray-600">
                  {{ uiHelpers.formatDateTimeAgo(campaign.created) }}
                </div>
                <div class="col-span-2 text-sm text-gray-600">
                  {{ uiHelpers.formatDateTimeAgo(campaign.edited) }}
                </div>
                <div class="col-span-1 text-sm text-gray-600">{{ campaign.status }}</div>
                <div class="col-span-1 text-sm text-gray-600">{{ campaign.author }}</div>
                <div class="col-span-1 justify-self-end">
                  <button
                    type="button"
                    class="rounded-full p-2 text-black duration-100 hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <i class="material-icons text-md">more_vert</i>
                  </button>
                </div>
              </div>
            </div>

            <div class="rounded-xl px-2 py-4">
              <div class="grid grid-cols-12 items-center">
                <div class="col-span-5">
                  <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
                </div>
                <div class="col-span-2">
                  <Skeleton class="h-3 w-[200px] rounded-full bg-gray-300" />
                </div>
                <div class="col-span-2">
                  <Skeleton class="h-3 w-[200px] rounded-full bg-gray-300" />
                </div>
                <div class="col-span-1">
                  <Skeleton class="h-3 w-[100px] rounded-full bg-gray-300" />
                </div>
                <div class="col-span-1">
                  <Skeleton class="h-3 w-[100px] rounded-full bg-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import CommandCenter from '../components/CommandCenter.vue'
import { Skeleton } from '@/core/components/ui/skeleton'
import { uiHelpers } from '@/core/utils/ui-helper'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { Bars3Icon, Cog6ToothIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const navigation = [
  { name: 'All Campaigns', href: '#', icon: 'grid_view', current: true },
  { name: 'Recents', href: '#', icon: 'history', current: false },
]
const teams = [
  { id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false },
  { id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
  { id: 3, name: 'Workcation', href: '#', initial: 'W', current: false },
]

const campaigns = [
  {
    name: 'Cellphone Page Campaign',
    platform: 'Meta',
    account: 'Cellphone Page',
    created: '2023-09-15T12:00:00Z',
    edited: '2024-10-01T12:00:00Z',
    status: 'active',
    author: 'Paul Dela Vega',
  },
  {
    name: 'Email Marketing Campaign',
    platform: 'Email Marketing',
    account: 'Cellphone Page',
    created: '2021-09-15T12:00:00Z',
    edited: '2024-09-01T12:00:00Z',
    status: 'active',
    author: 'Paul Dela Vega',
  },
]

interface Platforms {
  name: string
  icon: string
}

const platforms: Platforms[] = [
  { name: 'Meta', icon: 'bxl-meta' },
  { name: 'Email Marketing', icon: 'bx-envelope' },
  { name: 'Google My Business', icon: 'bxl-google' },
  { name: 'Whatsapp', icon: 'bxl-whatsapp' },
  { name: 'SMS Marketing', icon: 'bx-message-rounded' },
  { name: 'E-Commerce', icon: 'bx-shopping-bag' },
  { name: 'OmniChannel', icon: 'bx-group' },
]

const find_icon = (name: string): string | undefined => {
  const platform = platforms.find((platform) => platform.name === name)
  const icon = platform ? platform.icon : undefined
  console.log(icon)
  return icon
}

const sidebarOpen = ref(false)
</script>

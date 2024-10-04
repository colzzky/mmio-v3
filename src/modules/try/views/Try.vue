<template>
    <HomeLayout>
        <main class="py-2">
            <div class="px-4 sm:px-6 lg:px-8">
                <div class="w-full py-2 px-2">
                    <div class="py-2 px-2 rounded-xl">
                        <div class="grid grid-cols-12 items-center">
                            <div class="col-span-5 text-xs font-light">Name</div>
                            <div class="col-span-2 text-xs font-light">Created</div>
                            <div class="col-span-2 text-xs font-light">Updated</div>
                            <div class="col-span-1 text-xs font-light">Status</div>
                            <div class="col-span-1 text-xs font-light">Last Updated</div>
                            <div class="col-span-1 text-xs font-light"></div>
                        </div>
                    </div>

                    <div v-for="campaign in campaigns" :key="campaign.name"
                        class="py-2 hover:bg-gray-300 transition-all duration-100 px-2 rounded-xl">
                        <div class="grid grid-cols-12 items-center">
                            <div class="col-span-5">
                                <div class="flex items-center gap-x-3">
                                    <i class='bx text-2xl' :class="find_icon(campaign.platform)"></i>
                                    <div class="grid gap-0">
                                        <span class="text-sm">{{ campaign.name }}</span>
                                        <span class="text-xs">{{ campaign.account }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-2 text-sm text-gray-600">{{
                                uiHelpers.formatDateTimeAgo(campaign.created) }}</div>
                            <div class="col-span-2 text-sm text-gray-600">{{
                                uiHelpers.formatDateTimeAgo(campaign.edited) }}</div>
                            <div class="col-span-1 text-sm text-gray-600">{{ campaign.status }}</div>
                            <div class="col-span-1 text-sm text-gray-600">{{ campaign.author }}</div>
                            <div class="col-span-1 justify-self-end">
                                <button type="button"
                                    class="rounded-full p-2 text-black duration-100 hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                                    <i class="material-icons text-md">more_vert</i>
                                </button>
                            </div>

                        </div>


                    </div>

                    <div class="py-4 px-2 rounded-xl">
                        <div class="grid grid-cols-12 items-center">
                            <div class="col-span-5">
                                <Skeleton class="w-[300px] h-3 rounded-full bg-gray-300" />
                            </div>
                            <div class="col-span-2">
                                <Skeleton class="w-[200px] h-3 rounded-full bg-gray-300" />
                            </div>
                            <div class="col-span-2">
                                <Skeleton class="w-[200px] h-3 rounded-full bg-gray-300" />
                            </div>
                            <div class="col-span-1">
                                <Skeleton class="w-[100px] h-3 rounded-full bg-gray-300" />
                            </div>
                            <div class="col-span-1">
                                <Skeleton class="w-[100px] h-3 rounded-full bg-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </HomeLayout>
</template>

<script setup lang="ts">
import  HomeLayout  from '@/core/layouts/HomeLayout.vue'
import { Skeleton } from '@/core/components/ui/skeleton'
import { ref } from 'vue'
import { uiHelpers } from '@/core/utils/ui-helper';


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

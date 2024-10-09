<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import router from '@/router';
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const { user_auth } = authStore

const configuration = [
  {
    icon: 'loyalty',
    name: 'Plans & Subscriptions',
    href: '#',
  },
  {
    icon: 'language',
    name: 'Languages',
    href: '#',
  },
  {
    icon: 'cloud_sync',
    name: 'Account Import',
    href: '#',
  },
  {
    icon: 'api',
    name: 'API Integration',
    href: '#',
  },
  {
    icon: 'logout',
    name: 'Logout',
    href: '#',
  },
  {
    icon: 'settings',
    name: 'Settings',
    href: '#',
  },
]

const signOut = async () => {
  await user_auth.signOut()
  router.push({name:"login"})
}


</script>

<template>
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-300 px-6 pb-4 pt-8">
      <DropdownMenu>
        <DropdownMenuTrigger class="flex items-center gap-x-1">
          <i class="material-icons text-4xl">pin</i>
          <span class="text-xl font-extrabold">MMIO</span>
          <i class="material-icons">arrow_drop_down</i>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item #1</DropdownMenuItem>
          <DropdownMenuItem>Item #2</DropdownMenuItem>
          <DropdownMenuItem>Item #3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-4">
          <slot />

          <li class="-mx-2 mt-auto">
            <ul class="grid">
              <li v-for="item in configuration" :key="item.name">
                <div v-if="item.name === 'Logout'">
                  <div @click="signOut()"
                    class="group flex items-center gap-x-3 rounded-md px-2 py-1 text-xs font-semibold leading-6 hover:bg-primary/5 cursor-pointer">
                    <i class="material-icons text-sm">{{ item.icon }}</i>
                    {{ item.name }}
                  </div>
                </div>
                <div v-else>
                  <RouterLink :to="item.href"
                    class="group flex items-center gap-x-3 rounded-md px-2 py-1 text-xs font-semibold leading-6 hover:bg-primary/5">
                    <i class="material-icons text-sm">{{ item.icon }}</i>
                    {{ item.name }}
                  </RouterLink>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import DesktopSidebar from '@/core/components/sidebar/desktop-sidebar.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/core/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.user_auth.signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <DesktopSidebar />
  <div class="lg:pl-72">
    <header class="flex items-center justify-between">
      <div></div>
      <div class="flex items-center gap-x-2 px-4 py-3">
        <button type="button" class="size-8 rounded hover:bg-primary/5">
          <i class="bx bx-bell text-xl" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger class="grid place-content-center">
            <Avatar class="size-8">
              <AvatarImage :src="'https://placehold.co/32'" />
              <AvatarFallback>MMIO</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="me-4 mt-2 text-xs">
            <DropdownMenuLabel
              class="grid grid-cols-[var(--avatar-icon)_1fr] grid-rows-[repeat(2,minmax(0,calc(var(--avatar-icon)/2)))] gap-x-2 text-[10px] [--avatar-icon:32px]"
            >
              <Avatar class="row-span-2 size-[var(--avatar-icon)]">
                <AvatarImage src="https://placehold.co/32" />
                <AvatarFallback>MMIO</AvatarFallback>
              </Avatar>
              <span class="font-medium">kodapaul (You)</span>
              <span class="font-bold text-muted-foreground underline">paul.delavega@gmail.com</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="flex items-center gap-x-2" as-child>
              <RouterLink to="/settings/profile">
                <i class="bx bx-user text-lg" />
                Profile
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-x-2" as-child>
              <RouterLink to="/settings/api-integrations">
                <i class="bx bx-box text-lg" />
                API Integrations
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-x-2" as-child>
              <RouterLink to="/settings">
                <i class="bx bx-cog text-lg" />
                Settings
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-x-2" @click="handleLogout">
              <i class="bx bx-log-out text-lg" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <RouterView />
  </div>
</template>

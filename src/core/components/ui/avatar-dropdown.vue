<script setup lang="ts">
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
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const {user} = authStore

async function handleLogout() {
  await authStore.user_auth.signOut()
  router.replace({ name: 'login' })
}

const route = useRoute()
</script>

<template>
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
        <span class="font-medium">{{ user.data?.displayName }} (You)</span>
        <span class="font-bold text-muted-foreground underline">{{ user.data?.email }}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="flex items-center gap-x-2" as-child>
        <RouterLink :to="{ name: 'profile' }">
          <i class="bx bx-user text-lg" />
          Profile
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem v-if="route.params.workspaceId" class="flex items-center gap-x-2" as-child>
        <RouterLink :to="{ name: 'workspace-settings-integrations' }">
          <i class="bx bx-box text-lg" />
          API Integrations
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem class="flex items-center gap-x-2" as-child>
        <RouterLink :to="{ name: 'teams' }">
          <i class="bx bx-group text-lg" />
          Teams
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem class="flex items-center gap-x-2" as-child>
        <RouterLink :to="{ name: 'permissions' }">
          <i class="bx bx-lock-open text-lg" />
          Permissions
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem class="flex items-center gap-x-2" as-child>
        <RouterLink :to="{ name: 'account' }">
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
</template>

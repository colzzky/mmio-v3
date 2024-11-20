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
import cn from '@/core/utils/cn'
import { useAuthStore } from '@/stores/authStore'
import { computed, type HTMLAttributes } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const classes = computed(() => cn('p-4', props.class))

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.user_auth.signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <header class="flex h-16 items-center justify-between p-4">
    <div class="grid gap-y-0.5">
      <h1 class="font-bold leading-6 tracking-tight">
        <slot name="heading" />
      </h1>
      <slot name="subheading" />
    </div>
    <div class="flex items-center gap-x-2">
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
            <RouterLink :to="{ name: 'workspace-settings-integrations' }">
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
  <main :class="classes">
    <slot />
  </main>
</template>

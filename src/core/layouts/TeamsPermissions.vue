<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { sidebarLinks } from '@/modules/teams-permissions/routes'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const layoutLoad = ref(false)
const useAuth = useAuthStore()
const { page_init } = useAuth
</script>

<template>
  <div class="page-container h-screen overflow-hidden" v-if="!layoutLoad && page_init.initialize">
    <div
      class="mx-auto grid w-[calc(100svw-calc(var(--gutter)*2))] max-w-screen-xl grid-cols-[minmax(250px,275px)_1fr] gap-8 py-[var(--gutter)] [--gutter:theme(spacing.4)]"
    >
      <header class="col-span-2 flex items-center justify-between border-b py-2">
        <span class="flex items-center gap-x-2 text-xl font-bold">
          <i class="material-icons text-5xl">pin</i>
          Teams and Permissions
        </span>
        <Button variant="secondary" as-child>
          <RouterLink to="/">Return</RouterLink>
        </Button>
      </header>
      <aside class="col-span-1 flex flex-col gap-y-2">
        <section v-for="link in sidebarLinks" :key="link.name" class="flex flex-col">
          <div
            @click="router.push({ name: link.name })"
            class="flex cursor-pointer items-center gap-x-2 rounded-md px-4 py-1 text-lg font-semibold transition-all duration-75 hover:bg-gray-300"
            :class="{
              'bg-gray-300': route.path.toLowerCase().startsWith(`/team-permission/${link.name}`),
            }"
          >
            <i :class="['bx text-[length:var(--icon-size)]', link.icon]" />
            {{ link.label }}
          </div>
        </section>
      </aside>

      <slot />
    </div>
  </div>

  <div v-else class="flex h-screen flex-col items-center justify-center bg-gray-100">
    <div class="flex animate-pulse items-center gap-x-1">
      <i class="material-icons text-4xl">pin</i>
      <span class="text-xl font-extrabold">MMIO</span>
    </div>
    <div class="flex items-center justify-center space-x-2">
      <i class="material-icons animate-spin text-sm">donut_large</i>
      <div>Loading</div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  /* This will apply only to this page */
  margin: 0;
  padding: 0;
}
</style>

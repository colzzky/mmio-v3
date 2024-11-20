<script setup lang="ts">
import Main from '../components/ui/main.vue'

const links = [
  {
    label: 'General',
    routeName: 'workspace-settings-general',
  },
  {
    label: 'Integrations',
    routeName: 'workspace-settings-integrations',
  },
  {
    label: 'Languages',
    routeName: 'workspace-settings-languages',
  },
]
</script>

<template>
  <Main class="grid gap-y-4">
    <template #heading>Project Settings</template>
    <template #subheading>
      <div class="flex items-center gap-x-1">
        <RouterLink
          v-for="link in links"
          :key="link.routeName"
          :to="{ name: link.routeName }"
          class="rounded-full border-primary/15 px-3 py-0.5 text-[10px] aria-[current=page]:border aria-[current=page]:bg-primary/10"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </template>
    <RouterView />
  </Main>
</template>

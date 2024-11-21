<script setup lang="ts">
import AvatarDropdown from '@/core/components/ui/avatar-dropdown.vue'
import cn from '@/core/utils/cn'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const classes = computed(() => cn('p-4', props.class))
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
      <AvatarDropdown />
    </div>
  </header>
  <main :class="classes">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Icon } from '@iconify/vue'
</script>

<template>
  <div
    class="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center rounded-lg border bg-card text-card-foreground"
  >
    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:zoom-in" class="size-6" />
    </Button>
    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:zoom-out" class="size-6" />
    </Button>

    <!-- write and read only -->
    <Button v-if="true" type="button" size="icon" variant="ghost">
      <Icon icon="mdi:pencil-circle" class="size-12" />
    </Button>
    <Button v-else type="button" size="icon" variant="ghost">
      <Icon icon="bx:book-reader" class="size-12" />
    </Button>

    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:undo" class="size-6" />
    </Button>
    <Button type="button" size="icon" variant="ghost">
      <Icon icon="bx:redo" class="size-6" />
    </Button>

    <div
      class="absolute inset-x-4 bottom-[calc(100%+theme(spacing.2))] flex items-center justify-between rounded-lg bg-neutral-300 px-3 py-1.5 text-sm text-card-foreground"
    >
      <span>Read Mode</span>
      <button type="button" class="text-blue-500 hover:text-blue-600">Edit</button>
    </div>
  </div>
</template>

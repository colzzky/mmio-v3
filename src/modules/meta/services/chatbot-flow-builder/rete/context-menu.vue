<script setup lang="ts">
import NodeCard from './node-card.vue'
import { Icon } from '@iconify/vue'

defineEmits<{
  (e: 'addClick', node: 'reference_node' | 'message_node' | 'carousel_node'): void
  (e: 'clearClick'): void
}>()
</script>

<template>
  <NodeCard
    class="absolute z-50 grid min-h-[unset] w-48 select-none grid-cols-[calc(var(--icon-size)+var(--button-x-padding)),1fr] gap-x-3 p-1 text-start font-medium [--button-x-padding:theme(spacing.2)] [--icon-size:20px] hover:ring-0"
  >
    <!-- @temporary: development purposes -->
    <button
      type="button"
      class="col-span-full grid grid-cols-subgrid items-center gap-x-2 rounded-lg px-[var(--button-x-padding)] py-1.5 hover:bg-neutral-200"
      @click="$emit('addClick', 'reference_node')"
    >
      <Icon icon="bx:bolt-circle" class="size-[var(--icon-size)]" />
      <span class="text-start">Reference</span>
    </button>

    <button
      type="button"
      class="col-span-full grid grid-cols-subgrid items-center gap-x-2 rounded-lg px-[var(--button-x-padding)] py-1.5 hover:bg-neutral-200"
      @click="$emit('addClick', 'message_node')"
    >
      <Icon icon="bx:message" class="size-[var(--icon-size)]" />
      <span class="text-start">Message</span>
    </button>
    <button
      type="button"
      class="col-span-full grid grid-cols-subgrid items-center gap-x-2 rounded-lg px-[var(--button-x-padding)] py-1.5 hover:bg-neutral-200"
      @click="$emit('addClick', 'carousel_node')"
    >
      <Icon icon="bx:carousel" class="size-[var(--icon-size)]" />
      <span class="text-start">Carousel</span>
    </button>

    <!-- @temporary: development purposes -->
    <button
      type="button"
      class="col-span-full grid grid-cols-subgrid items-center gap-x-2 rounded-lg px-[var(--button-x-padding)] py-1.5 hover:bg-neutral-200"
      @click="$emit('clearClick')"
    >
      <Icon icon="bx:trash" class="size-[var(--icon-size)]" />
      <span class="text-start">Clear</span>
    </button>

    <button
      type="button"
      class="col-span-full grid grid-cols-subgrid items-center gap-x-2 rounded-lg px-[var(--button-x-padding)] py-1.5 hover:bg-neutral-200"
    >
      <Icon icon="bx:window-close" class="size-[var(--icon-size)]" />
      <span class="text-start">Close</span>
    </button>
  </NodeCard>
</template>

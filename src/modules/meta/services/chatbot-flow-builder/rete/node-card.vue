<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { type HTMLAttributes } from 'vue'

const props = withDefaults(defineProps<{ class?: HTMLAttributes['class'] }>(), { class: '' })
</script>

<template>
  <article
    :class="
      twMerge(
        'relative min-h-36 w-64 rounded-xl border-2 border-neutral-200 bg-neutral-100 py-4 text-sm text-primary [--socket-size:20px] hover:ring hover:ring-blue-200 data-[selected=true]:ring data-[selected=true]:ring-blue-500',
        props.class,
      )
    "
    @dblclick.stop=""
  >
    <slot />
  </article>
</template>

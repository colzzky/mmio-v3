<script setup lang="ts">
import { Ref } from 'rete-vue-plugin'
import { twMerge } from 'tailwind-merge'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Ref
    :class="
      twMerge(
        '[&>div[title=socket]]:m-0 [&>div[title=socket]]:size-[var(--socket-size)] [&>div[title=socket]]:rounded-full [&>div[title=socket]]:border-none [&>div[title=socket]]:border-primary [&>div[title=socket]]:bg-blue-500 [&>div[title=socket]]:ring [&>div[title=socket]]:ring-primary hover:[&>div[title=socket]]:bg-blue-700',
        props.class,
      )
    "
  />
</template>

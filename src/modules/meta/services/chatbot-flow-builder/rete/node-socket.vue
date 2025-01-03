```
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
        '[&>div[class=socket]]:m-0 [&>div[class=socket]]:size-[var(--socket-size)] [&>div[class=socket]]:rounded-full [&>div[class=socket]]:border-none [&>div[class=socket]]:border-primary [&>div[class=socket]]:bg-blue-500 [&>div[class=socket]]:ring [&>div[class=socket]]:ring-primary hover:[&>div[class=socket]]:bg-blue-700',
        props.class,
      )
    "
  />
</template>
```
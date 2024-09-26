<script setup lang="ts">
import { computed } from 'vue'
import { Button } from './ui/button'
import { RouterLink } from 'vue-router'
import cn from '../utils/cn'

const props = defineProps<{ to: string; className?: string }>()

const classes = computed(() =>
  cn(
    'group flex items-center justify-start gap-x-3 text-background/25 hover:bg-foreground/50 hover:text-background aria-[current=page]:bg-foreground/25 aria-[current=page]:text-background/75',
    props.className,
  ),
)
</script>

<template>
  <Button as-child :class="classes">
    <RouterLink :to>
      <slot />
    </RouterLink>
  </Button>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { Button } from './ui/button'
import { RouterLink } from 'vue-router'
import cn from '../utils/cn'

const props = defineProps<{ to: string; class?: HTMLAttributes['class'] }>()

const classes = computed(() =>
  cn(
    'group flex items-center justify-start gap-x-3 text-primary-foreground/50 hover:text-primary-foreground/75 hover:bg-primary-foreground/5 aria-[current=page]:text-primary-foreground aria-[current=page]:bg-primary-foreground/10',
    props.class,
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

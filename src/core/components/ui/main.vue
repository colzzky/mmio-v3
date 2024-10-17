<script setup lang="ts">
import cn from '@/core/utils/cn'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const classes = computed(() => cn('p-4', props.class))
</script>

<template>
  <main :class="classes">
    <h1 class="text-xl/6 font-bold tracking-tight">
      <slot name="heading">NO HEADING TEMPLATE</slot>
    </h1>
    <slot />
  </main>
</template>

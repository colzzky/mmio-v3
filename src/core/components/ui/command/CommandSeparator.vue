<script setup lang="ts">
import cn from '@/core/utils/cn'
import type { ComboboxSeparatorProps } from 'radix-vue'
import { ComboboxSeparator } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<ComboboxSeparatorProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <ComboboxSeparator v-bind="delegatedProps" :class="cn('-mx-1 h-px bg-border', props.class)">
    <slot />
  </ComboboxSeparator>
</template>

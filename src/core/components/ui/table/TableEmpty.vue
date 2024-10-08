<script setup lang="ts">
import TableCell from './TableCell.vue'
import TableRow from './TableRow.vue'
import cn from '@/core/utils/cn'
import { type HTMLAttributes, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    colspan?: number
  }>(),
  {
    colspan: 1,
  },
)

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <TableRow>
    <TableCell
      :class="cn('whitespace-nowrap p-4 align-middle text-sm text-foreground', props.class)"
      v-bind="delegatedProps"
    >
      <div class="flex items-center justify-center py-10">
        <slot />
      </div>
    </TableCell>
  </TableRow>
</template>

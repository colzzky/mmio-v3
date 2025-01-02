<script setup lang="ts">
import CarouselSheet from './sheets/carousel-sheet.vue'
import MessageSheet from './sheets/message-sheet.vue'
import { Sheet, SheetTrigger } from '@/core/components/ui/sheet'
import type { Node, NodeType } from '@/modules/meta/utils/flow-types'

defineProps<{ data: Node<keyof NodeType> }>()

const sheets: Record<keyof NodeType, any> = {
  message_node: MessageSheet,
  carousel_node: CarouselSheet,
  generic_node: MessageSheet,
  reference_node: MessageSheet,
}
</script>

<template>
  <Sheet :modal="false">
    <SheetTrigger>edit</SheetTrigger>
    <component :is="sheets[data.label]" :data />
  </Sheet>
</template>

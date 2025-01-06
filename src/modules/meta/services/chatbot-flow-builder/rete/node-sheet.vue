<script setup lang="ts" generic="S extends BaseSchemes, K">
import MessageSheet from './sheets/message-sheet.vue'
import { Sheet } from '@/core/components/ui/sheet'
import { Node, type NodeType } from '@/modules/meta/utils/flow-types'
import type { BaseSchemes } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { onUnmounted, reactive } from 'vue'

defineProps<{ area: AreaPlugin<S, K> }>()

type SheetState = {
  isOpen: boolean
  data: Node<keyof Omit<NodeType, 'reference_node'>> | undefined

  initialState(): void
  open(): void
  close(): void
  initializeData(event: Event): void
}
const sheet = reactive<SheetState>({
  isOpen: false,
  data: undefined,

  initialState() {
    this.isOpen = false
    this.data = undefined
  },
  open() {
    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  initializeData(event) {
    const { detail } = event as CustomEvent

    this.data = detail as Node<keyof Omit<NodeType, 'reference_node'>>

    this.open()
  },
})

const componentMapping: Record<keyof Omit<NodeType, 'reference_node'>, any> = {
  message_node: MessageSheet,
}

document.addEventListener('triggerNodeSheet', (event) => sheet.initializeData(event), true)

onUnmounted(() => {
  document.removeEventListener('triggerNodeSheet', (event) => sheet.initializeData(event), true)
})
</script>

<template>
  <Sheet v-if="sheet.data" :modal="false" :open="sheet.isOpen" @update:open="sheet.close()">
    <component :is="componentMapping[sheet.data.label]" :data="sheet.data" :area />
  </Sheet>
</template>

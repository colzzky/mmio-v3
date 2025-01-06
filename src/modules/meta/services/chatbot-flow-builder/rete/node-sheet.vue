<script setup lang="ts" generic="S extends BaseSchemes, K">
import GenericSheet from './sheets/generic-sheet.vue'
import MessageSheet from './sheets/message-sheet.vue'
import { Sheet } from '@/core/components/ui/sheet'
import { type NodeType } from '@/modules/meta/utils/flow-types'
import type { BaseSchemes } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { onUnmounted, reactive } from 'vue'

defineProps<{ area: AreaPlugin<S, K> }>()

type Data =
  | {
      id: string
      label: keyof Omit<NodeType, 'reference_node'>
    }
  | undefined
type SheetState = {
  isOpen: boolean
  data: Data

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

    this.data = detail as Data

    this.open()
  },
})

const componentMapping: Record<keyof Omit<NodeType, 'reference_node'>, any> = {
  message_node: MessageSheet,
  generic_node: GenericSheet,
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

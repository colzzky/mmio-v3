<script setup lang="ts" generic="S extends BaseSchemes, K">
import {
  MessageSheet,
  GenericSheet,
  CarouselSheet,
  MediaSheet,
  ConditionSheet,
  NodeFlowDetailsSheet,
  TriggerSheet,
} from '.'
import SettingsTemplateSheet from './settings-template-sheet.vue'
import { Sheet, SheetContent } from '@/core/components/ui/sheet'
import { Node, type NodeType } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import type { BaseSchemes } from 'rete'
import { reactive, watch } from 'vue'

const authWorkspaceStore = useAuthWorkspaceStore()
const { active_flow } = authWorkspaceStore
const { rete_init } = active_flow

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
  initializeData(node: Node<keyof NodeType>): void
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
  initializeData(node) {
    if (node) {
      this.data = {
        id: node.id,
        label: node.label,
      } as Data
    }
  },
})

const componentMapping: Record<keyof Omit<NodeType, 'reference_node'>, any> = {
  message_node: MessageSheet,
  generic_node: GenericSheet,
  carousel_node: CarouselSheet,
  media_node: MediaSheet,
  condition_node: ConditionSheet,
  trigger_node: TriggerSheet,
}

watch(
  () => rete_init.selected_node,
  (node) => {
    if (node) {
      sheet.initializeData(node)
    } else {
      sheet.initialState()
    }
  },
)
</script>

<template>
  <Sheet :modal="false" :open="true">
    <NodeFlowDetailsSheet />
  </Sheet>

  <Sheet :modal="false" :open="true">
    <SheetContent
      class="w-[clamp(300px,100%,15%)] overflow-y-scroll p-0 shadow-none [&>button]:hidden"
    >
      <component v-if="sheet.data" :is="componentMapping[sheet.data.label]" />
      <SettingsTemplateSheet v-else />
    </SheetContent>
  </Sheet>
</template>

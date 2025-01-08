<script setup lang="ts" generic="S extends BaseSchemes, K">
import CarouselSheet from './sheets/carousel-sheet.vue'
import GenericSheet from './sheets/generic-sheet.vue'
import MediaSheet from './sheets/media-sheet.vue'
import MessageSheet from './sheets/message-sheet.vue'
import { Button } from '@/core/components/ui/button'
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
}

function selectNode(id: string) {
  rete_init.node_select(id)
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
    <SheetContent
      class="w-[clamp(300px,100%,15%)] overflow-y-scroll p-0 shadow-none [&>button]:hidden"
    >
      <component v-if="sheet.data" :is="componentMapping[sheet.data.label]" />
    </SheetContent>
  </Sheet>

  <Sheet :modal="false" :open="true">
    <SheetContent
      side="left"
      class="w-[clamp(300px,100%,15%)] overflow-y-scroll p-0 shadow-none [&>button]:hidden"
    >
      <div v-if="rete_init.editor && rete_init.editor.getNodes().length >= 1">
        <Button
          v-for="(node, key) in rete_init.editor.getNodes()"
          :key
          @click="selectNode(node.id)"
          class="w-full justify-start border-none"
          variant="outline"
          :class="{ 'bg-slate-100': node.id === rete_init.selected_node_id }"
        >
          {{ node.data?.name }}
        </Button>
      </div>
      <template v-else> No node available </template>
    </SheetContent>
  </Sheet>
</template>

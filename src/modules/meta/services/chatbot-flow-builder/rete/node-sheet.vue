<script setup lang="ts" generic="S extends BaseSchemes, K">
import SheetContent from '@/core/components/ui/sheet/SheetContent.vue'
import GenericSheet from './sheets/generic-sheet.vue'
import MessageSheet from './sheets/message-sheet.vue'
import { Sheet } from '@/core/components/ui/sheet'
import { Node, type NodeType } from '@/modules/meta/utils/flow-types'
import type { BaseSchemes } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { onUnmounted, reactive, watch } from 'vue'
import { VisuallyHidden } from 'radix-vue'
import DialogTitle from '@/core/components/ui/dialog/DialogTitle.vue'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import Button from '@/core/components/ui/button/Button.vue'
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
        label: node.label
      } as Data
    }
  },
})

const componentMapping: Record<keyof Omit<NodeType, 'reference_node'>, any> = {
  message_node: MessageSheet,
  generic_node: GenericSheet,
}

function selectNode(id:string) {
  rete_init.node_select(id)
}

watch(() => rete_init.selected_node, (node) => {
  if (node) {
    sheet.initializeData(node)
  } else {
    sheet.initialState()
  }
})
</script>

<template>
  <Sheet :modal="false" :open="true">
    <SheetContent side="right" class="p-0 w-[15%] overflow-y-scroll shadow-none">
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>


      <div v-if="sheet.data">
        <component :is="componentMapping[sheet.data.label]" :data="sheet.data" />
      </div>
      <div v-else>
        <div>Hi</div>
      </div v-else>
    </SheetContent>
  </Sheet>

  <Sheet :modal="false" :open="true">
    <SheetContent side="left" class="p-2  w-[15%] overflow-y-scroll shadow-none">
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>


      <div v-if="rete_init.editor">
        <div v-if="rete_init.editor.getNodes().length >= 1" class="flex flex-col gap-1">
          <div v-for="node in rete_init.editor.getNodes()">
            <Button @click="selectNode(node.id)" class="justify-start w-full border-none" variant="outline"
            :class="{'bg-slate-100':node.id === rete_init.selected_node_id}">{{ node.data?.name }}</Button>
          </div>
        </div>
        <div v-else>
          <div>No node available</div>
        </div>
      </div>

    </SheetContent>
  </Sheet>
</template>

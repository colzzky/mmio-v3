<script setup lang="ts">
import type { Flow, FlowsMap } from '../page.vue'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import type { Modal } from '@/core/utils/types'
import { inject, reactive } from 'vue'

const flows = inject('flows') as FlowsMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(flowId: Flow['id']): void

  flowId: Flow['id'] | null
  deleteFlow(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  flowId: null,
  initialState() {
    this.isOpen = false
    this.flowId = null
  },
  open(flowId) {
    this.isOpen = true
    this.flowId = flowId
  },
  close() {
    this.initialState()
  },
  deleteFlow() {
    if (!this.flowId) throw new Error('No Flow ID provided')

    const flow = flows.value.get(this.flowId)
    if (!flow) throw new Error('Flow not found')

    flows.value.delete(this.flowId)
    this.close()
  },
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Flow?</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this flow? This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button variant="destructive" @click="modal.deleteFlow()">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

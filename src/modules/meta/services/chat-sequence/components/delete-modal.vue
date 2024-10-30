<script setup lang="ts">
import type { Sequence, SequencesMap } from '../page.vue'
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

const sequences = inject('sequences') as SequencesMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(sequenceId: Sequence['id']): void

  sequenceId: Sequence['id'] | null
  deleteSequence(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  sequenceId: null,
  initialState() {
    this.isOpen = false
    this.sequenceId = null
  },
  open(sequenceId) {
    this.isOpen = true
    this.sequenceId = sequenceId
  },
  close() {
    this.initialState()
  },
  deleteSequence() {
    if (!this.sequenceId) throw new Error('No Sequences ID provided')

    sequences.value.delete(this.sequenceId)
    this.close()
  },
})

defineExpose({ modal })
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Chat Sequence?</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this chat sequence? This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button variant="destructive" @click="modal.deleteSequence()">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

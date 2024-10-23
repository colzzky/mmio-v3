<script setup lang="ts">
import type { GrowthTool, GrowthToolMap } from '../page.vue'
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

const growthTools = inject('growthTools') as GrowthToolMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(growthToolId: GrowthTool['id']): void

  growthToolId: GrowthTool['id'] | undefined
  deleteGrowthTool(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  growthToolId: undefined,
  initialState() {
    this.isOpen = false
  },
  open(growthToolId) {
    this.isOpen = true
    this.growthToolId = growthToolId
  },
  close() {
    this.initialState()
  },
  deleteGrowthTool() {
    if (!this.growthToolId) throw new Error('No Growth Tool ID provided')

    growthTools.value.delete(this.growthToolId)

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
        <DialogTitle>Delete Growth Tool?</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this growth tool? This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button variant="destructive" @click="modal.deleteGrowthTool()">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

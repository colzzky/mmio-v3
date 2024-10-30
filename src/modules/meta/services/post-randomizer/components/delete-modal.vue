<script setup lang="ts">
import type { Campaign, CampaignsMap } from '../page.vue'
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

const campaigns = inject('campaigns') as CampaignsMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(campaignId: Campaign['id']): void

  campaignId: Campaign['id'] | null
  deleteCampaign(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  campaignId: null,
  initialState() {
    this.isOpen = false
    this.campaignId = null
  },
  open(campaignId) {
    this.isOpen = true
    this.campaignId = campaignId
  },
  close() {
    this.initialState()
  },
  deleteCampaign() {
    if (!this.campaignId) throw new Error('No Campaign ID provided')

    campaigns.value.delete(this.campaignId)

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
        <DialogTitle>Delete Campaign?</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this campaign? This cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button variant="destructive" @click="modal.deleteCampaign()"> Delete </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

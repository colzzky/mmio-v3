<script setup lang="ts">
import type { Campaign, CampaignsMap } from '../page.vue'
import { Button } from '@/core/components/ui/button'
import DatePicker from '@/core/components/ui/date-picker.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import type { Modal } from '@/core/utils/types'
import { inject, reactive } from 'vue'

const campaigns = inject('campaigns') as CampaignsMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; campaignId: Campaign['id'] }): void

  campaignId: Campaign['id'] | null
  intent: 'create' | 'edit' | null
  form: Omit<Campaign, 'id' | 'status' | 'createdAt'>
  submitForm(): void
  createCampaign(): void
  editCampaign(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  campaignId: null,
  form: {
    mediaSource: '',
    name: '',
    publishedTo: {},
    duration: {},
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.campaignId = null
    this.form = {
      mediaSource: '',
      name: '',
      publishedTo: {},
      duration: {},
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      const campaign = campaigns.value.get(args.campaignId)
      if (!campaign) throw new Error('Campaign not found')

      this.campaignId = args.campaignId
      this.form = { ...campaign }
    }

    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  submitForm() {
    this.intent === 'create' ? this.createCampaign() : this.editCampaign()
    this.close()
  },
  createCampaign() {
    // @temporary: get the highest campaign id and increment it by 1
    const newCampaignId = Math.max(...Array.from(campaigns.value.keys())) + 1
    campaigns.value.set(newCampaignId, { ...this.form, status: 'inactive', createdAt: new Date() })
  },
  editCampaign() {
    if (!this.campaignId) throw new Error('No Campaign ID value')

    const campaign = campaigns.value.get(this.campaignId)
    if (!campaign) throw new Error('Campaign not found')

    campaigns.value.set(this.campaignId, { ...campaign, ...this.form })
  },
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="gap-y-8">
      <DialogHeader>
        <DialogTitle v-if="modal.intent === 'create'"> Create Campaign </DialogTitle>
        <DialogTitle v-else-if="modal.intent === 'edit'"> Edit Campaign </DialogTitle>
        <DialogDescription v-if="modal.intent === 'create'">
          Enter the campaign details to create a new campaign.
        </DialogDescription>
        <DialogDescription v-else-if="modal.intent === 'edit'">
          Enter the campaign details to edit this campaign.
        </DialogDescription>
      </DialogHeader>
      <form id="campaignForm" class="flex flex-col gap-y-4" @submit.prevent="modal.submitForm()">
        <div class="flex flex-col gap-y-2">
          <Label for="mediaSource">Media Source</Label>
          <Select id="mediaSource" v-model="modal.form.mediaSource">
            <SelectTrigger>
              <SelectValue placeholder="Select Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Source Foo">Source Foo</SelectItem>
                <SelectItem value="Source Bar">Source Bar</SelectItem>
                <SelectItem value="Source Baz">Source Baz</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="name">Name</Label>
          <Input
            type="text"
            id="name"
            v-model="modal.form.name"
            name="name"
            placeholder="Input Name"
            required
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="users">Instagram Business</Label>
          <Select id="users" v-model="modal.form.publishedTo.users">
            <SelectTrigger>
              <SelectValue placeholder="Select Instagram Business" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="User Foo">User Foo</SelectItem>
                <SelectItem value="User Bar">User Bar</SelectItem>
                <SelectItem value="User Baz">User Baz</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="pages">Pages</Label>
          <Select id="pages" v-model="modal.form.publishedTo.pages">
            <SelectTrigger>
              <SelectValue placeholder="Select Pages" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Page Foo">Page Foo</SelectItem>
                <SelectItem value="Page Bar">Page Bar</SelectItem>
                <SelectItem value="Page Baz">Page Baz</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="groups">Groups</Label>
          <Select id="groups" v-model="modal.form.publishedTo.groups">
            <SelectTrigger>
              <SelectValue placeholder="Select Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Group Foo">Group Foo</SelectItem>
                <SelectItem value="Group Bar">Group Bar</SelectItem>
                <SelectItem value="Group Baz">Group Baz</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-2 gap-x-4">
          <div class="flex flex-col gap-y-2">
            <Label as="span">Start Date</Label>
            <DatePicker
              :initialValue="modal.form.duration.start"
              @update:model-value="modal.form.duration.start = $event"
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label as="span">End Date</Label>
            <DatePicker
              :initial-value="modal.form.duration.end"
              @update:model-value="modal.form.duration.end = $event"
            />
          </div>
        </div>
      </form>
      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button v-if="modal.intent === 'create'" type="submit" form="campaignForm"> Create </Button>
        <Button v-else-if="modal.intent === 'edit'" type="submit" form="campaignForm">
          Edit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

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

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; campaignId: Campaign['id'] }): void
  intent: 'create' | 'edit' | null
  submitForm(): void
  createCampaign(): void
  editCampaign(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  initialState() {
    this.isOpen = false
    this.intent = null
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      //
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

  },
  editCampaign() {

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
        <template v-if="modal.intent === 'create'">
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Enter the campaign details to create a new campaign.
          </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription> Enter the campaign details to edit this campaign. </DialogDescription>
        </template>
      </DialogHeader>
      <form id="form" class="flex flex-col gap-y-4" @submit.prevent="modal.submitForm()">
        <div class="flex flex-col gap-y-2">
          <Label for="mediaSource">Media Source</Label>
          <Select id="mediaSource" required>
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
            name="name"
            placeholder="Input Name"
            required
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <Label for="users">Instagram Business</Label>
          <Select id="users" required>
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
          <Select id="pages"  required>
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
          <Select id="groups"  required>
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
              
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label as="span">End Date</Label>
            <DatePicker
            />
          </div>
        </div>
      </form>
      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button type="submit" form="form">
          {{ modal.intent === 'create' ? 'Create' : 'Edit' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

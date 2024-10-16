<script setup lang="ts">
import Badge from '@/core/components/ui/badge/Badge.vue'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import Main from '@/core/components/ui/main.vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import type { Modal } from '@/core/utils/types'
import { uiHelpers } from '@/core/utils/ui-helper'
import { reactive, ref } from 'vue'

// @temporary: can be extracted to another file
interface Campaign {
  id: number
  name: string
  mediaSource?: string
  publishedTo: {
    users?: string
    pages?: string
    groups?: string
  }
  duration: {
    start?: Date
    end?: Date
  }
  createdAt: Date
  status: 'disabled' | 'live'
}

const campaigns = ref(
  new Map<Campaign['id'], Omit<Campaign, 'id'>>([
    [
      4,
      {
        name: 'MMIO Posts',
        publishedTo: {},
        duration: {},
        createdAt: new Date(),
        status: 'disabled',
      },
    ],
    [
      146,
      {
        name: 'ASDASD',
        publishedTo: {},
        duration: {},
        createdAt: new Date(),
        status: 'disabled',
      },
    ],
    [
      712,
      {
        name: 'Post Randomizer Test',
        mediaSource: 'Post Randomizer Test',
        publishedTo: { pages: 'Filhomes' },
        duration: {},
        createdAt: new Date(),
        status: 'live',
      },
    ],
  ]),
)

// CREATE/EDIT CAMPAIGN
interface CreateOrEditCampaignModal extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; campaignId: Campaign['id'] }): void

  editCampaignId: Campaign['id'] | null
  intent: 'create' | 'edit' | null
  form: Omit<Campaign, 'id'>
  submitForm(): void
  createCampaign(): void
  editCampaign(): void
}

const createOrEditCampaignModal = reactive<CreateOrEditCampaignModal>({
  isOpen: false,
  intent: null,
  editCampaignId: null,
  form: {
    name: '',
    publishedTo: {},
    duration: {},
    status: 'disabled',
    createdAt: new Date(),
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.editCampaignId = null
    this.form = {
      name: '',
      publishedTo: {},
      duration: {},
      status: 'disabled',
      createdAt: new Date(),
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      const campaign = campaigns.value.get(args.campaignId)
      if (!campaign) throw new Error('Campaign not found')

      this.editCampaignId = args.campaignId
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
    campaigns.value.set(newCampaignId, { ...this.form, createdAt: new Date() })
  },
  editCampaign() {
    if (!this.editCampaignId) throw new Error('No Campaign ID value')

    campaigns.value.set(this.editCampaignId, { ...this.form })
  },
})

// TOGGLE CAMPAIGN STATUS
function handleToggleCampaignStatus(campaignId: Campaign['id']) {
  const campaign = campaigns.value.get(campaignId)
  if (!campaign) throw new Error('Campaign not found')

  campaigns.value.set(campaignId, {
    ...campaign,
    status: campaign.status === 'live' ? 'disabled' : 'live',
  })
}

// DELETE CAMPAIGN
interface DeleteCampaignModal extends Omit<Modal, 'open'> {
  campaignId: Campaign['id'] | null
  open(campaignId: Campaign['id']): void
  deleteCampaign(): void
}

const deleteCampaignModal = reactive<DeleteCampaignModal>({
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

    const campaign = campaigns.value.get(this.campaignId)
    if (!campaign) throw new Error('Campaign not found')

    campaigns.value.delete(this.campaignId)

    this.close()
  },
})
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Post Randomizer</template>
      <Button
        class="gap-x-2 self-end"
        @click="createOrEditCampaignModal.open({ intent: 'create' })"
      >
        <i class="bx bx-plus text-xl" />
        Create Campaign
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Source Name</TableHead>
            <TableHead>Published To</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="[id, campaign] in campaigns" :key="id">
            <TableCell>{{ campaign.name }}</TableCell>
            <TableCell>{{ campaign.mediaSource }}</TableCell>
            <TableCell>
              <div class="5 flex flex-col gap-y-0">
                <div><strong>Users: </strong>{{ campaign.publishedTo?.users ?? 'No Target' }}</div>
                <div><strong>Pages: </strong>{{ campaign.publishedTo.pages ?? 'No Target' }}</div>
                <div>
                  <strong>Groups: </strong>{{ campaign.publishedTo?.groups ?? 'No Target' }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-y-0.5">
                <div>
                  <strong>Start: </strong>
                  {{ campaign.duration.start?.toLocaleDateString() ?? 'As soon as possible' }}
                </div>
                <div>
                  <strong>End: </strong>
                  {{ campaign.duration.end?.toLocaleDateString() ?? 'Continuous' }}
                </div>
              </div>
            </TableCell>
            <TableCell>{{ campaign.createdAt }}</TableCell>
            <!-- @temporary: can be changed to a `<Switch />` component -->
            <TableCell>
              <Badge>{{ uiHelpers.toTitleCase(campaign.status) }}</Badge>
            </TableCell>
            <TableCell>
              <div class="grid place-content-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <i class="material-icons text-md">more_vert</i>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem class="gap-x-3" @click="handleToggleCampaignStatus(id)">
                      <i
                        :class="[
                          'bx text-xl',
                          campaign.status === 'live' ? 'bx-toggle-left' : 'bxs-toggle-right',
                        ]"
                      />
                      Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3">
                      <i class="bx bxs-report text-xl" />
                      View Report
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="gap-x-3"
                      @click="createOrEditCampaignModal.open({ intent: 'edit', campaignId: id })"
                    >
                      <i class="bx bx-edit text-xl" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3" @click="deleteCampaignModal.open(id)">
                      <i class="bx bx-trash text-xl" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Main>

    <!-- Create/Edit Campaign Modal -->
    <Dialog
      v-model:open="createOrEditCampaignModal.isOpen"
      @update:open="createOrEditCampaignModal.close()"
    >
      <DialogContent class="gap-y-8">
        <DialogHeader>
          <DialogTitle v-if="createOrEditCampaignModal.intent === 'create'">
            Create Campaign
          </DialogTitle>
          <DialogTitle v-else-if="createOrEditCampaignModal.intent === 'edit'">
            Edit Campaign
          </DialogTitle>
          <DialogDescription v-if="createOrEditCampaignModal.intent === 'create'">
            Enter the campaign details to create a new campaign.
          </DialogDescription>
          <DialogDescription v-else-if="createOrEditCampaignModal.intent === 'edit'">
            Enter the campaign details to edit this campaign.
          </DialogDescription>
        </DialogHeader>
        <form
          id="campaignForm"
          class="flex flex-col gap-y-4"
          @submit.prevent="createOrEditCampaignModal.submitForm()"
        >
          <div class="flex flex-col gap-y-2">
            <Label for="mediaSource">Media Source</Label>
            <Select id="mediaSource" v-model="createOrEditCampaignModal.form.mediaSource">
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
              v-model="createOrEditCampaignModal.form.name"
              name="name"
              placeholder="Input Name"
              required
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label for="users">Instagram Business</Label>
            <Select id="users" v-model="createOrEditCampaignModal.form.publishedTo.users">
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
            <Select id="pages" v-model="createOrEditCampaignModal.form.publishedTo.pages">
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
            <Select id="groups" v-model="createOrEditCampaignModal.form.publishedTo.groups">
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
                :initialValue="createOrEditCampaignModal.form.duration.start"
                @update:model-value="createOrEditCampaignModal.form.duration.start = $event"
              />
            </div>
            <div class="flex flex-col gap-y-2">
              <Label as="span">End Date</Label>
              <DatePicker
                :initial-value="createOrEditCampaignModal.form.duration.end"
                @update:model-value="createOrEditCampaignModal.form.duration.end = $event"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="secondary" @click="createOrEditCampaignModal.close()">Cancel</Button>
          <Button
            v-if="createOrEditCampaignModal.intent === 'create'"
            type="submit"
            form="campaignForm"
          >
            Create
          </Button>
          <Button
            v-else-if="createOrEditCampaignModal.intent === 'edit'"
            type="submit"
            form="campaignForm"
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirm Delete Modal -->
    <Dialog v-model:open="deleteCampaignModal.isOpen" @update:open="deleteCampaignModal.close()">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Campaign?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this campaign? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" @click="deleteCampaignModal.close()">Cancel</Button>
          <Button variant="destructive" @click="deleteCampaignModal.deleteCampaign()">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DefaultLayout>
</template>

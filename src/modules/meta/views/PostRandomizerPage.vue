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

// @temporary: can be extracted to another file
interface Modal {
  isOpen: boolean
  initialState(): void
  open(): void
  close(): void
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

// CREATE CAMPAIGN
interface CreateCampaignModal extends Modal {
  form: Omit<Campaign, 'id' | 'createdAt'>
  createCampaign(): void
}

const createCampaignModal = reactive<CreateCampaignModal>({
  isOpen: false,
  form: {
    name: '',
    publishedTo: {},
    duration: {},
    status: 'disabled',
  },
  initialState() {
    this.isOpen = false
    this.form = {
      name: '',
      publishedTo: {},
      duration: {},
      status: 'disabled',
    }
  },
  open() {
    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  createCampaign() {
    campaigns.value.set(new Date().getSeconds(), {
      ...this.form,
      createdAt: new Date(),
    })

    this.close()
  },
})

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
  open(campaignId: Campaign['id']) {
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
    <main class="flex flex-col gap-y-4 p-4">
      <Button
        class="flex items-center justify-center gap-x-2 self-end"
        @click="createCampaignModal.open()"
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
              <dl class="grid grid-cols-2 gap-x-2 gap-y-0.5 whitespace-nowrap [&>dt]:font-bold">
                <dt>Users:</dt>
                <dd>{{ campaign.publishedTo?.users ?? 'No Target' }}</dd>
                <dt>Pages:</dt>
                <dd>{{ campaign.publishedTo.pages ?? 'No Target' }}</dd>
                <dt>Groups:</dt>
                <dd>{{ campaign.publishedTo?.groups ?? 'No Target' }}</dd>
              </dl>
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
            <TableCell>{{ campaign.createdAt.toLocaleDateString() }}</TableCell>
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
                    <DropdownMenuItem class="flex gap-x-2">
                      <i class="bx bxs-report text-xl" />
                      View Report
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-x-2">
                      <i class="bx bx-edit text-xl" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem class="flex gap-x-2" @click="deleteCampaignModal.open(id)">
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
    </main>

    <!-- Create Campaign Modal -->
    <Dialog v-model:open="createCampaignModal.isOpen">
      <DialogContent class="gap-y-8">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription
            >Enter the campaign details to create a new campaign.</DialogDescription
          >
        </DialogHeader>
        <form
          id="createCampaign"
          class="flex flex-col gap-y-4"
          @submit.prevent="createCampaignModal.createCampaign()"
        >
          <div class="flex flex-col gap-y-2">
            <Label for="mediaSource">Media Source</Label>
            <Select id="mediaSource" v-model="createCampaignModal.form.mediaSource">
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
              v-model="createCampaignModal.form.name"
              name="name"
              placeholder="Input Name"
              required
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <Label for="users">Instagram Business</Label>
            <Select id="users" v-model="createCampaignModal.form.publishedTo.users">
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
            <Select id="pages" v-model="createCampaignModal.form.publishedTo.pages">
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
            <Select id="groups" v-model="createCampaignModal.form.publishedTo.groups">
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
              <DatePicker @update:model-value="createCampaignModal.form.duration.start = $event" />
            </div>
            <div class="flex flex-col gap-y-2">
              <Label as="span">End Date</Label>
              <DatePicker
                v-model="createCampaignModal.form.duration.end"
                @update:model-value="createCampaignModal.form.duration.end = $event"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="secondary" @click="createCampaignModal.close()">Cancel</Button>
          <Button type="submit" form="createCampaign">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirm Delete Modal -->
    <Dialog v-model:open="deleteCampaignModal.isOpen">
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

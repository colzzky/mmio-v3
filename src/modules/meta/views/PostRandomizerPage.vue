<script setup lang="ts">
import Badge from '@/core/components/ui/badge/Badge.vue'
import { Button } from '@/core/components/ui/button'
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
  source: string | null
  publishedTo: {
    users: string | null
    pages: string | null
    groups: string | null
  }
  duration: {
    start: Date | null
    end: Date | null
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
        source: null,
        publishedTo: {
          users: null,
          pages: null,
          groups: null,
        },
        duration: {
          start: null,
          end: null,
        },
        createdAt: new Date(),
        status: 'disabled',
      },
    ],
    [
      146,
      {
        name: 'ASDASD',
        source: null,
        publishedTo: {
          users: null,
          pages: null,
          groups: null,
        },
        duration: {
          start: null,
          end: null,
        },
        createdAt: new Date(),
        status: 'disabled',
      },
    ],
    [
      712,
      {
        name: 'Post Randomizer Test',
        source: 'Post Randomizer Test',
        publishedTo: {
          users: null,
          pages: 'Filhomes',
          groups: null,
        },
        duration: {
          start: new Date('August 11, 2022'),
          end: new Date(),
        },
        createdAt: new Date(),
        status: 'live',
      },
    ],
  ]),
)

interface ConfirmDeleteModal extends Omit<Modal, 'open'> {
  campaignId: Campaign['id'] | null
  open(campaignId: Campaign['id']): void
  deleteCampaign(): void
}

const confirmDeleteModal = reactive<ConfirmDeleteModal>({
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
            <TableCell>{{ campaign.source }}</TableCell>
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
                  <strong>End: </strong> {{ campaign.duration.end?.toDateString() ?? 'Continuous' }}
                </div>
              </div>
            </TableCell>
            <TableCell>{{ campaign.createdAt.toDateString() }}</TableCell>
            <!-- @temporary: can be changed to a `<Switch />` component -->
            <TableCell>
              <Badge>{{ uiHelpers.toTitleCase(campaign.status) }}</Badge>
              {{ confirmDeleteModal }}
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
                    <DropdownMenuItem class="flex gap-x-2" @click="confirmDeleteModal.open(id)">
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

    <!-- Confirm Delete Modal -->
    <Dialog v-model:open="confirmDeleteModal.isOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Campaign?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this campaign? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" @click="confirmDeleteModal.close()">Cancel</Button>
          <Button variant="destructive" @click="confirmDeleteModal.deleteCampaign()">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DefaultLayout>
</template>

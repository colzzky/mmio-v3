<script setup lang="ts">
import CreateEditModal from './components/create-edit-modal.vue'
import DeleteModal from './components/delete-modal.vue'
import Badge from '@/core/components/ui/badge/Badge.vue'
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import Main from '@/core/components/ui/main.vue'
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
import { provide, ref, useTemplateRef } from 'vue'

// @temporary: can be extracted to another file
export interface Campaign {
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
  status: 'active' | 'inactive'
}

const campaigns = ref(
  new Map<Campaign['id'], Campaign>([
    [
      4,
      {
        id: 4,
        name: 'MMIO Posts',
        publishedTo: {},
        duration: {},
        createdAt: new Date(),
        status: 'inactive',
      },
    ],
    [
      146,
      {
        id: 146,
        name: 'ASDASD',
        publishedTo: {},
        duration: {},
        createdAt: new Date(),
        status: 'inactive',
      },
    ],
    [
      712,
      {
        id: 712,
        name: 'Post Randomizer Test',
        mediaSource: 'Post Randomizer Test',
        publishedTo: { pages: 'Filhomes' },
        duration: {},
        createdAt: new Date(),
        status: 'active',
      },
    ],
  ]),
)
export type CampaignsMap = typeof campaigns
provide('campaigns', campaigns)

// TOGGLE CAMPAIGN STATUS
function handleToggleCampaignStatus(campaignId: Campaign['id']) {
  const campaign = campaigns.value.get(campaignId)
  if (!campaign) throw new Error('Campaign not found')

  campaigns.value.set(campaignId, {
    ...campaign,
    status: campaign.status === 'active' ? 'inactive' : 'active',
  })
}

const createEditModalRef = useTemplateRef('createEditModal')
const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Post Randomizer</template>
      <Button
        class="gap-x-2 self-end"
        @click="createEditModalRef?.modal.open({ intent: 'create' })"
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
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="[campaignId, campaign] in campaigns" :key="campaignId">
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
            <TableCell class="whitespace-nowrap">{{
              uiHelpers.formatDateTimeAgo(campaign.createdAt.toDateString())
            }}</TableCell>
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
                    <DropdownMenuItem
                      class="gap-x-3"
                      @click="createEditModalRef?.modal.open({ intent: 'edit', campaignId })"
                    >
                      <i class="bx bx-edit text-xl" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="gap-x-3"
                      @click="handleToggleCampaignStatus(campaignId)"
                    >
                      <i
                        :class="[
                          'bx text-xl',
                          campaign.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                        ]"
                      />
                      Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3" disabled>
                      <i class="bx bxs-report text-xl" />
                      View Report
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="gap-x-3"
                      @click="deleteModalRef?.modal.open(campaignId)"
                    >
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

    <CreateEditModal ref="createEditModal" />
    <DeleteModal ref="deleteModal" />
  </DefaultLayout>
</template>

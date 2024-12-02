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
import Skeleton from '@/core/components/ui/skeleton/Skeleton.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { onMounted, provide, ref, useTemplateRef } from 'vue'


// TOGGLE CAMPAIGN STATUS
// function handleToggleCampaignStatus(campaignId: Campaign['id']) {
//   const campaign = campaigns.value.get(campaignId)
//   if (!campaign) throw new Error('Campaign not found')

//   campaigns.value.set(campaignId, {
//     ...campaign,
//     status: campaign.status === 'active' ? 'inactive' : 'active',
//   })
// }

const authWorkspaceStore = useAuthWorkspaceStore()
const { workspace_service, service_models } = authWorkspaceStore
const { post_randomizer } = workspace_service

const createEditModalRef = useTemplateRef('createEditModal')
const deleteModalRef = useTemplateRef('deleteModal')
const pageLoad = ref(false)


onMounted(async () => {
  pageLoad.value = true
  //Do something here if you want to fetch first
  pageLoad.value = false
  await post_randomizer.fetch_campaigns()
})

</script>

<template>
  <Main class="flex flex-col gap-y-4">
    <template #heading>Post Randomizer</template>
    <Button class="gap-x-2 self-end" @click="createEditModalRef?.modal.open({ intent: 'create', prId: null })">
      <i class="bx bx-plus text-xl" />
      Create Campaign
    </Button>
    <div v-if="!post_randomizer.isLoading">
      <div v-if="post_randomizer.data.length > 0">
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
            <TableRow v-for="campaign, campaign_index in post_randomizer.data" :key="campaign_index">
              <TableCell>{{ campaign.name }}</TableCell>
              <TableCell>
                <div class="flex flex-col gap-y-0.5">
                  <div>
                    <strong>Start: </strong>
                    {{ campaign.startDate }}
                  </div>
                  <div>
                    <strong>End: </strong>
                    {{ campaign.endDate }}
                  </div>
                </div>
              </TableCell>
              <TableCell class="whitespace-nowrap">{{
                uiHelpers.formatDateTimeAgo(campaign.createdAt)
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
                      <DropdownMenuItem class="gap-x-3"
                        @click="router.push({ name: 'post-randomizer-view', params: { randomizer_id: campaign.pr_id } })">
                        <i class="bx bx-edit text-xl" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3"
                        @click="createEditModalRef?.modal.open({ intent: 'edit', prId: campaign.pr_id })">
                        <i class="bx bx-edit text-xl" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3">
                        <i :class="[
                          'bx text-xl',
                          campaign.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                        ]" />
                        Toggle Status
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3" disabled>
                        <i class="bx bxs-report text-xl" />
                        View Report
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3">
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
      </div>
      <div v-else>No Available Data</div>
    </div>
    <div v-else>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
            </TableCell>
            <TableCell>
              <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
            </TableCell>
            <TableCell>
              <Skeleton class="h-3 w-[300px] rounded-full bg-gray-300" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </Main>

  <CreateEditModal ref="createEditModal" />
  <DeleteModal ref="deleteModal" />
</template>
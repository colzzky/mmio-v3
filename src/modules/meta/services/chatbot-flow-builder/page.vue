<script setup lang="ts">
import CreateEditModal from './components/create-edit-modal.vue'
import { Badge } from '@/core/components/ui/badge'
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
import type { ChatbotFlowServiceData } from '@/core/types/WorkSpaceTypes'
import { PermissionAccessError, servicePermission } from '@/core/utils/permissionHelpers'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { onMounted, useTemplateRef } from 'vue'

export type Flow = {
  id: string
  name: string
  status: 'inactive' | 'active'
  createdAt: Date
}

const authWorkspaceStore = useAuthWorkspaceStore()
const { workspace_service, imported_meta_pages, active_flow } = authWorkspaceStore
const { chatbot_flow } = workspace_service

onMounted(async () => {
  try {
    //await servicePermission.check(PermissionServices.ChatBotFlow, ['clone'])
    await servicePermission.general(['ChatbotFlow::view'])
    await imported_meta_pages.fetch_meta_pages()
    await chatbot_flow.fetch_chatbots()
  } catch (error: any) {
    if (error instanceof PermissionAccessError) {
      router.back()
    } else {
      console.error('Unknown error:', error)
    }
  }
})

const navigateFlow = (flow: ChatbotFlowServiceData) => {
  active_flow.setActiveChatBotFlow(flow)
  router.push({
    name: 'chatbot-flow-final',
    params: {
      cb_id: flow.cb_id,
    },
  })
}

const createEditModalRef = useTemplateRef('createEditModal')
// const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <Main class="flex flex-col gap-y-4">
    <template #heading>Chatbot Flow Builder</template>
    <Button
      class="gap-x-2 self-end"
      @click="createEditModalRef?.modal.open({ intent: 'create', flowId: null })"
    >
      <i class="bx bx-plus text-xl" />
      Create Messenger Flow
    </Button>
    <div v-if="!chatbot_flow.isLoading && !imported_meta_pages.isLoading">
      <div v-if="chatbot_flow.data.length > 0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flow Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead class="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="flow in chatbot_flow.data" :key="flow.cb_id">
              <TableCell>{{ flow.name }}</TableCell>
              <TableCell>
                <Badge>
                  {{ uiHelpers.toTitleCase(flow.status) }}
                </Badge>
              </TableCell>
              <TableCell class="whitespace-nowrap">{{
                uiHelpers.timestampToDateTimeAgo(flow.updatedAt)
              }}</TableCell>
              <TableCell>
                <div class="grid place-content-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <i class="material-icons text-md">more_vert</i>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem @click="navigateFlow(flow)" class="gap-x-3">
                        <i class="bx bx-navigation text-xl" />
                        Navigate Flow
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="gap-x-3"
                        @click="
                          createEditModalRef?.modal.open({ intent: 'edit', flowId: flow.cb_id })
                        "
                      >
                        <i class="bx bx-edit text-xl" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3">
                        <i
                          :class="[
                            'bx text-xl',
                            flow.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                          ]"
                        />
                        Toggle Status
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3">
                        <i class="bx bx-copy text-xl" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3" disabled>
                        <i class="bx bx-share-alt text-xl" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem class="gap-x-3" disabled>
                        <i class="bx bxs-error text-xl" />
                        View Error Logs
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
  <!-- <DeleteModal ref="deleteModal" /> -->
</template>

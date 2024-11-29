<script setup lang="ts">
import CreateEditModal from './components/create-edit-modal.vue'
import DeleteModal from './components/delete-modal.vue'
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
import { PermissionServices } from '@/core/types/PermissionTypes'
import { PermissionAccessError, servicePermission } from '@/core/utils/permissionHelpers'
import { uiHelpers } from '@/core/utils/ui-helper'
import router from '@/router'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { onMounted, useTemplateRef, watch } from 'vue'

export type Flow = {
  id: string
  name: string
  status: 'inactive' | 'active'
  createdAt: Date
}

const authWorkspaceStore = useAuthWorkspaceStore()
const { service_models, workspace_service, imported_meta_pages } = authWorkspaceStore
const { chatbot_flow } = workspace_service
const { chatbot_flow: chatbot_flow_md } = service_models

function fetch_chatbot_flow() {

}

onMounted(async () => {
  try {
    await servicePermission.check(PermissionServices.ChatBotFlow, ['view'])
    await imported_meta_pages.fetch_meta_pages()
    await chatbot_flow.fetch_chatbots()
  } catch (error: any) {
    if (error instanceof PermissionAccessError) {
      router.back();
    } else {
      console.error('Unknown error:', error);
    }
  }

})

const createEditModalRef = useTemplateRef('createEditModal')
// const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <Main class="flex flex-col gap-y-4">
    <template #heading>Chatbot Flow Builder</template>
    <Button class="gap-x-2 self-end" @click="createEditModalRef?.modal.open({ intent: 'create', flowId: null })">
      <i class="bx bx-plus text-xl" />
      Create Messenger Flow
    </Button>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Flow Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead class="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody v-if="!chatbot_flow.isLoading && !imported_meta_pages.isLoading">
        <TableRow v-if="chatbot_flow.data.length > 0" v-for="flow in chatbot_flow.data" :key="flow.cb_id">
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
                  <DropdownMenuItem class="gap-x-3"
                    @click="createEditModalRef?.modal.open({ intent: 'edit', flowId: flow.cb_id })">>
                    <i class="bx bx-edit text-xl" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-3">
                    <i :class="[
                      'bx text-xl',
                      flow.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                    ]" />
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
        <TableBody v-else>
          No Available data
        </TableBody>
      </TableBody>
      <TableBody v-else>
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
  </Main>

  <CreateEditModal ref="createEditModal" />
  <!-- <DeleteModal ref="deleteModal" /> -->
</template>

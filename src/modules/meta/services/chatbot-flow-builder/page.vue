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
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { uiHelpers } from '@/core/utils/ui-helper'
import { useMetaRelatedStore } from '@/stores/metaRelatedStore'
import { useProjectStore } from '@/stores/projectStore'
import { computed, onMounted, provide, ref, useTemplateRef, watch } from 'vue'

export type Flow = {
  id: string
  name: string
  status: 'inactive' | 'active'
  createdAt: Date
}

const metaStore = useMetaRelatedStore()
const useProject = useProjectStore()
const { chat_bot_flow, chat_bot_flow_list } = metaStore
const { project_data } = useProject

onMounted(async () => {
  if (project_data.isInitialized && project_data.data?.pj_id) {
    console.log('project initlized')
    await loadChatBotFlows()
    chat_bot_flow_list.isInitialized = true
  } else {
    console.log('project not initlized')
  }
})

const loadChatBotFlows = async () => {
  chat_bot_flow_list.resetData()
  const get_flow = await chat_bot_flow.getWhere(
    [{ fieldName: 'pj_id', operator: '==', value: project_data.data?.pj_id }],
    10,
    [
      {
        fieldName: 'updatedAt',
        direction: 'asc',
      },
    ],
    chat_bot_flow_list.lastSnapshot,
  )

  console.log(get_flow)

  if (get_flow.status) {
    if (get_flow.data.length > 0) {
      chat_bot_flow_list.lastSnapshot = get_flow.data[get_flow.data.length - 1].cb_id
    }
    get_flow.data.forEach((flow) => {
      chat_bot_flow_list.data.push(flow)
    })
  }
  chat_bot_flow_list.isLoading = false
  chat_bot_flow_list.isInitialized = true
}

watch(
  () => project_data.isInitialized,
  async (newValue, oldValue) => {
    if (newValue) {
      if (!chat_bot_flow_list.isInitialized) {
        await loadChatBotFlows()
      }

      // const project = platform_api_list.data.find(api => api.platform === 'META');
      // console.log(platform);
      // if (platform) {
      //     set_fb_api(platform.api_account as MetaAPIAccount, platform);
      //     await set_fb_pages()
      // } else {
      //     fb_api_load.value = false
      //     fb_pages_load.value = false
      // }
    }
  },
)

// const flows = ref(
//   new Map<Flow['id'], Flow>([
//     [
//       174924,
//       {
//         id: 174924,
//         name: 'Coupon Code Generator Demo',
//         status: 'active',
//         createdAt: new Date('2024-05-08'),
//       },
//     ],
//     [
//       173482,
//       {
//         id: 173482,
//         name: 'Chatbot AI Article Generator',
//         status: 'active',
//         createdAt: new Date('2024-02-19'),
//       },
//     ],
//     [
//       173406,
//       {
//         id: 173406,
//         name: 'Makati Event Ads',
//         status: 'active',
//         createdAt: new Date('2024-02-14'),
//       },
//     ],
//     [
//       172677,
//       {
//         id: 172677,
//         name: 'Timegap Test 2024',
//         status: 'active',
//         createdAt: new Date('2024-01-06'),
//       },
//     ],
//     [
//       171319,
//       {
//         id: 171319,
//         name: 'Food Ordering Bot',
//         status: 'active',
//         createdAt: new Date('2023-10-08'),
//       },
//     ],
//   ]),
// )
// const sortedFlows = computed(() =>
//   Array.from(flows.value.entries()).sort(
//     ([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//   ),
// )
// export type FlowsMap = typeof flows
// provide('flows', flows)

// // TOGGLE FLOW STATUS
// function handleToggleFlowStatus(flowId: Flow['id']) {
//   const flow = flows.value.get(flowId)
//   if (!flow) throw new Error('Flow not found')

//   flows.value.set(flowId, {
//     ...flow,
//     status: flow.status === 'active' ? 'inactive' : 'active',
//   })
// }

// // CLONE FLOW
// function handleCloneFlow(flowId: Flow['id']) {
//   const flow = flows.value.get(flowId)
//   if (!flow) throw new Error('Flow not found')

//   // @temporary: get the highest flow id and increment it by 1
//   const newFlowId = Math.max(...Array.from(flows.value.keys())) + 1
//   flows.value.set(newFlowId, {
//     id: newFlowId,
//     name: `${flow.name} Clone`,
//     status: flow.status,
//     createdAt: new Date(),
//   })
// }

const createEditModalRef = useTemplateRef('createEditModal')
const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Chatbot Flow Builder</template>
      <Button
        class="gap-x-2 self-end"
        @click="createEditModalRef?.modal.open({ intent: 'create' })"
      >
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
        <TableBody v-if="!chat_bot_flow_list.isLoading">
          <TableRow v-for="(flow, index) in chat_bot_flow_list.data" :key="flow.cb_id">
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
                    <DropdownMenuItem class="gap-x-3">
                      <!-- @click="deleteModalRef?.modal.open({ intent: 'edit', flowId:flow.cb_id })"> -->
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
    <DeleteModal ref="deleteModal" />
  </DefaultLayout>
</template>

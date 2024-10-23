<script setup lang="ts">
import CreateEditFlowModal from './components/create-edit-flow-modal.vue'
import DeleteFlowModal from './components/delete-flow-modal.vue'
import { Badge } from '@/core/components/ui/badge'
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
import { computed, provide, ref, useTemplateRef } from 'vue'

export type Flow = {
  id: number
  name: string
  status: 'inactive' | 'active'
  createdAt: Date
}

const flows = ref(
  new Map<Flow['id'], Omit<Flow, 'id'>>([
    [
      174924,
      {
        name: 'Coupon Code Generator Demo',
        status: 'active',
        createdAt: new Date('2024-05-08'),
      },
    ],
    [
      173482,
      {
        name: 'Chatbot AI Article Generator',
        status: 'active',
        createdAt: new Date('2024-02-19'),
      },
    ],
    [
      173406,
      {
        name: 'Makati Event Ads',
        status: 'active',
        createdAt: new Date('2024-02-14'),
      },
    ],
    [
      172677,
      {
        name: 'Timegap Test 2024',
        status: 'active',
        createdAt: new Date('2024-01-06'),
      },
    ],
    [
      171319,
      {
        name: 'Food Ordering Bot',
        status: 'active',
        createdAt: new Date('2023-10-08'),
      },
    ],
  ]),
)
const sortedFlows = computed(() =>
  Array.from(flows.value.entries()).sort(
    ([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)
export type FlowsMap = typeof flows
provide('flows', flows)

// TOGGLE FLOW STATUS
function handleToggleFlowStatus(flowId: Flow['id']) {
  const flow = flows.value.get(flowId)
  if (!flow) throw new Error('Flow not found')

  flows.value.set(flowId, {
    ...flow,
    status: flow.status === 'active' ? 'inactive' : 'active',
  })
}

// CLONE FLOW
function handleCloneFlow(flowId: Flow['id']) {
  const flow = flows.value.get(flowId)
  if (!flow) throw new Error('Flow not found')

  // @temporary: get the highest flow id and increment it by 1
  const newFlowId = Math.max(...Array.from(flows.value.keys())) + 1
  flows.value.set(newFlowId, {
    name: `${flow.name} Clone`,
    status: flow.status,
    createdAt: new Date(),
  })
}

const createEditFlowModalRef = useTemplateRef('createEditFlowModal')
const deleteFlowModalRef = useTemplateRef('deleteFlowModal')
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Chatbot Flow Builder</template>
      <Button
        class="gap-x-2 self-end"
        @click="createEditFlowModalRef?.modal.open({ intent: 'create' })"
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
        <TableBody>
          <TableRow v-for="[id, flow] in sortedFlows" :key="id">
            <TableCell>{{ flow.name }}</TableCell>
            <TableCell>
              <Badge>
                {{ uiHelpers.toTitleCase(flow.status) }}
              </Badge>
            </TableCell>
            <TableCell class="whitespace-nowrap">{{
              uiHelpers.formatDateTimeAgo(flow.createdAt.toDateString())
            }}</TableCell>
            <TableCell>
              <div class="grid place-content-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <i class="material-icons text-md">more_vert</i>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      class="gap-x-3"
                      @click="createEditFlowModalRef?.modal.open({ intent: 'edit', flowId: id })"
                    >
                      <i class="bx bx-edit text-xl" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3" @click="handleToggleFlowStatus(id)">
                      <i
                        :class="[
                          'bx text-xl',
                          flow.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                        ]"
                      />
                      Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3" @click="handleCloneFlow(id)">
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
                    <DropdownMenuItem class="gap-x-3" @click="deleteFlowModalRef?.modal.open(id)">
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

    <CreateEditFlowModal ref="createEditFlowModal" />
    <DeleteFlowModal ref="deleteFlowModal" />
  </DefaultLayout>
</template>

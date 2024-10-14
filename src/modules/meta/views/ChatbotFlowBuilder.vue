<script setup lang="ts">
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
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
import { ref } from 'vue'

type Flow = {
  id: number
  name: string
  status: 'disabled' | 'published'
  createdAt: Date
}

const flows = ref(
  new Map<Flow['id'], Omit<Flow, 'id'>>([
    [
      174924,
      {
        name: 'Coupon Code Generator Demo',
        status: 'published',
        createdAt: new Date(),
      },
    ],
    [
      173482,
      {
        name: 'Chatbot AI Article Generator',
        status: 'published',
        createdAt: new Date(),
      },
    ],
    [
      173406,
      {
        name: 'Makati Event Ads',
        status: 'published',
        createdAt: new Date(),
      },
    ],
    [
      172677,
      {
        name: 'Timegap Test 2024',
        status: 'published',
        createdAt: new Date(),
      },
    ],
    [
      171319,
      {
        name: 'Food Ordering Bot',
        status: 'published',
        createdAt: new Date(),
      },
    ],
  ]),
)

function handleToggleFlowStatus(flowId: Flow['id']) {
  const flow = flows.value.get(flowId)
  if (!flow) throw new Error('Flow not found')

  flows.value.set(flowId, {
    ...flow,
    status: flow.status === 'published' ? 'disabled' : 'published',
  })
}
</script>

<template>
  <DefaultLayout>
    <main class="flex flex-col gap-y-4 p-4">
      <Button class="gap-x-2 self-end">
        <i class="bx bx-plus text-xl" />
        Create Messenger Flow
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Flow Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead class="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="[id, flow] in flows" :key="id">
            <TableCell>{{ id }}</TableCell>
            <TableCell>{{ flow.name }}</TableCell>
            <TableCell>
              <Badge>
                {{ uiHelpers.toTitleCase(flow.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ flow.createdAt }}</TableCell>
            <TableCell>
              <div class="grid place-content-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <i class="material-icons text-md">more_vert</i>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem class="gap-x-3">
                      <i class="bx bxs-error text-xl" />
                      View Error Logs
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3" @click="handleToggleFlowStatus(id)">
                      <i
                        :class="[
                          'bx text-xl',
                          flow.status === 'published' ? 'bx-toggle-left' : 'bxs-toggle-right',
                        ]"
                      />
                      Toggle Status
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3">
                      <i class="bx bx-copy text-xl" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3">
                      <i class="bx bx-share-alt text-xl" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3">
                      <i class="bx bx-edit text-xl" />
                      Edit
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
    </main>
  </DefaultLayout>
</template>

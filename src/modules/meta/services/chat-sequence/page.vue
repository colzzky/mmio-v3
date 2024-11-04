<script setup lang="ts">
import CreateEditModal from './components/create-edit-modal.vue'
import DeleteModal from './components/delete-modal.vue'
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
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/core/components/ui/table'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { uiHelpers } from '@/core/utils/ui-helper'
import { provide, ref, useTemplateRef } from 'vue'

export interface Sequence {
  id: number
  name: string
  createdAt: Date
}

const sequences = ref(
  new Map<Sequence['id'], Sequence>([
    [
      1,
      {
        id: 1,
        name: 'User Onboarding',
        createdAt: new Date('2023-01-15'),
      },
    ],
    [
      2,
      {
        id: 2,
        name: 'Email Verification',
        createdAt: new Date('2023-02-12'),
      },
    ],
    [
      3,
      {
        id: 3,
        name: 'Password Reset',
        createdAt: new Date('2023-03-18'),
      },
    ],
    [
      4,
      {
        id: 4,
        name: 'Subscription Renewal',
        createdAt: new Date('2023-04-22'),
      },
    ],
    [
      5,
      {
        id: 5,
        name: 'Order Processing',
        createdAt: new Date('2023-05-07'),
      },
    ],
    [
      6,
      {
        id: 6,
        name: 'Feedback Collection',
        createdAt: new Date('2023-06-14'),
      },
    ],
    [
      7,
      {
        id: 7,
        name: 'Referral Program',
        createdAt: new Date('2023-07-10'),
      },
    ],
    [
      8,
      {
        id: 8,
        name: 'Notification Preferences',
        createdAt: new Date('2023-08-03'),
      },
    ],
    [
      9,
      {
        id: 9,
        name: 'Product Recommendations',
        createdAt: new Date('2023-09-20'),
      },
    ],
    [
      10,
      {
        id: 10,
        name: 'Cart Abandonment',
        createdAt: new Date('2023-10-05'),
      },
    ],
  ]),
)

export type SequencesMap = typeof sequences
provide('sequences', sequences)

const createEditModalRef = useTemplateRef('createEditModal')
const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <Main class="flex flex-col gap-y-4">
    <template #heading>Chat Sequence</template>
    <Button class="gap-x-2 self-end" @click="createEditModalRef?.modal.open({ intent: 'create' })">
      <i class="bx bx-plus text-xl" />
      Create Chat Sequence
    </Button>
    <Table>
      <TableHeader>
        <TableHead>Name</TableHead>
        <TableHead>Created</TableHead>
        <TableHead class="text-center">Actions</TableHead>
      </TableHeader>
      <TableBody>
        <TableRow v-for="[sequenceId, sequence] in sequences" :key="sequenceId">
          <TableCell>{{ sequence.name }}</TableCell>
          <TableCell>
            {{ uiHelpers.formatDateTimeAgo(sequence.createdAt.toDateString()) }}
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
                    @click="createEditModalRef?.modal.open({ intent: 'edit', sequenceId })"
                  >
                    <i class="bx bx-edit text-xl" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-3" disabled>
                    <i class="bx bxs-report text-xl" />
                    View Report
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-3" @click="deleteModalRef?.modal.open(sequenceId)">
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
</template>

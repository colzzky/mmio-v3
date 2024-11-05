<script setup lang="ts">
import CreateEditModal from './components/create-edit-modal.vue'
import DeleteModal from './components/delete-modal.vue'
import type { GrowthToolType } from './utils'
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
import { uiHelpers } from '@/core/utils/ui-helper'
import { computed, provide, ref, useTemplateRef } from 'vue'

export interface GrowthTool {
  id: number
  name: string
  type: (typeof GrowthToolType)[number]
  page: string
  createdAt: Date
}

const growthTools = ref(
  new Map<GrowthTool['id'], GrowthTool>([
    [
      1,
      {
        id: 1,
        name: 'Chat Support Tool',
        type: 'Custom Chat Plugin',
        page: 'MarketingMaster.io',
        createdAt: new Date('2023-01-15'),
      },
    ],
    [
      2,
      {
        id: 2,
        name: 'Newsletter Signup',
        type: 'Checkbox Plugin',
        page: 'MarketingMaster.io',
        createdAt: new Date('2023-03-10'),
      },
    ],
    [
      3,
      {
        id: 3,
        name: 'Messenger Promo Link',
        type: 'Messenger Link Plugin (M.me)',
        page: 'MarketingMaster.io',
        createdAt: new Date('2023-05-22'),
      },
    ],
    [
      4,
      {
        id: 4,
        name: 'Send to Messenger Offer',
        type: 'Send to Messenger Plugin',
        page: 'MarketingMaster.io',
        createdAt: new Date('2023-08-02'),
      },
    ],
  ]),
)

export type GrowthToolMap = typeof growthTools
provide('growthTools', growthTools)

const sortedGrowthTools = computed(() =>
  Array.from(growthTools.value.entries()).sort(
    ([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

function cloneGrowthTool(growthToolId: GrowthTool['id']) {
  const growthTool = growthTools.value.get(growthToolId)
  if (!growthTool) throw new Error('Growth tool not found')

  // @temporary: get the highest growth tool id and increment it by 1
  const newGrowthToolId = Math.max(...Array.from(growthTools.value.keys())) + 1
  growthTools.value.set(newGrowthToolId, {
    ...growthTool,
    id: newGrowthToolId,
    name: `${growthTool.name} Clone`,
    createdAt: new Date(),
  })
}

const createEditModal = useTemplateRef('createEditModal')
const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <Main class="flex flex-col gap-y-4">
    <template #heading>Growth Tools</template>
    <Button class="gap-x-2 self-end" @click="createEditModal?.modal.open({ intent: 'create' })">
      <i class="bx bx-plus text-xl" />
      Create Growth Tool
    </Button>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Page Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead class="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="[growthToolId, growthTool] in sortedGrowthTools" :key="growthToolId">
          <TableCell>{{ growthTool.name }}</TableCell>
          <TableCell>{{ growthTool.type }}</TableCell>
          <TableCell>{{ growthTool.page }}</TableCell>
          <TableCell>
            {{ uiHelpers.formatDateTimeAgo(growthTool.createdAt.toISOString()) }}
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
                    @click="createEditModal?.modal.open({ intent: 'edit', growthToolId })"
                  >
                    <i class="bx bx-edit text-xl" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-3" @click="cloneGrowthTool(growthToolId)">
                    <i class="bx bx-copy text-xl" />
                    Clone
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="gap-x-3"
                    @click="deleteModalRef?.modal.open(growthToolId)"
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
</template>

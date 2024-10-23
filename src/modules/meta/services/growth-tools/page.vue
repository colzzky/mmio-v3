<script setup lang="ts">
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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import { uiHelpers } from '@/core/utils/ui-helper'
import { computed, provide, ref, useTemplateRef } from 'vue'

type GrowthToolType =
  | 'custom-chat-plugin'
  | 'checkbox-plugin'
  | 'messenger-link-plugin'
  | 'send-to-messenger-plugin'

const growthToolTypeLabels: Record<GrowthToolType, string> = {
  'custom-chat-plugin': 'Custom Chat Plugin',
  'checkbox-plugin': 'Checkbox Plugin',
  'messenger-link-plugin': 'Messenger Link Plugin (M.me)',
  'send-to-messenger-plugin': 'Send to Messenger Plugin',
}

export interface GrowthTool {
  id: number
  name: string
  type: GrowthToolType
  pageName: string
  createdAt: Date
}

const growthTools = ref(
  new Map<GrowthTool['id'], GrowthTool>([
    [
      1,
      {
        id: 1,
        name: 'Chat Support Tool',
        type: 'custom-chat-plugin',
        pageName: 'MarketingMaster.io',
        createdAt: new Date('2023-01-15'),
      },
    ],
    [
      2,
      {
        id: 2,
        name: 'Newsletter Signup',
        type: 'checkbox-plugin',
        pageName: 'MarketingMaster.io',
        createdAt: new Date('2023-03-10'),
      },
    ],
    [
      3,
      {
        id: 3,
        name: 'Messenger Promo Link',
        type: 'messenger-link-plugin',
        pageName: 'MarketingMaster.io',
        createdAt: new Date('2023-05-22'),
      },
    ],
    [
      4,
      {
        id: 4,
        name: 'Send to Messenger Offer',
        type: 'send-to-messenger-plugin',
        pageName: 'MarketingMaster.io',
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

const deleteModalRef = useTemplateRef('deleteModal')
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Growth Tools</template>
      <Button class="gap-x-2 self-end">
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
            <TableCell>{{ growthToolTypeLabels[growthTool.type] }}</TableCell>
            <TableCell>{{ growthTool.pageName }}</TableCell>
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
                    <DropdownMenuItem class="gap-x-3" disabled>
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

    <DeleteModal ref="deleteModal" />
  </DefaultLayout>
</template>

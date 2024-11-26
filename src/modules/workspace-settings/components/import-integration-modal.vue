<script setup lang="ts">
import { pendingIntegrations } from '../temporaries'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent } from '@/core/components/ui/dialog'
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
import type { Modal } from '@/core/utils/types'
import { uiHelpers } from '@/core/utils/ui-helper'
import { reactive } from 'vue'

interface ModalInterface extends Omit<Modal, 'open'> {
  integrationName: string | null

  open(integrationName: string): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  integrationName: null,
  initialState() {
    this.isOpen = false
    this.integrationName = null
  },
  open(integrationName) {
    this.isOpen = true
    this.integrationName = integrationName
  },
  close() {
    this.initialState()
  },
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="max-w-screen-md p-12">
      <section class="grid gap-y-12">
        <h2
          class="text-balance bg-gradient-to-r from-gradient-purple to-gradient-red bg-clip-text text-center text-5xl font-bold text-transparent"
        >
          Choose the {{ modal.integrationName }} you want to import
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(integration, index) in pendingIntegrations" :key="index">
              <TableCell>{{ integration.name }}</TableCell>
              <TableCell>{{
                uiHelpers.formatDateTimeAgo(integration.createdAt.toString())
              }}</TableCell>
              <TableCell>{{
                uiHelpers.formatDateTimeAgo(integration.expiredAt.toString())
              }}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <span class="sr-only">Open Integrations Menu</span>
                    <i class="bx bx-dots-vertical-rounded text-xl" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Item #1</DropdownMenuItem>
                    <DropdownMenuItem>Item #2</DropdownMenuItem>
                    <DropdownMenuItem>Item #3</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Button class="justify-self-center">Import</Button>
      </section>
    </DialogContent>
  </Dialog>
</template>

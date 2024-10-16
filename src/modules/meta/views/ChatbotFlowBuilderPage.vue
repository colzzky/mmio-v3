<script setup lang="ts">
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
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
import type { Modal } from '@/core/utils/types'
import { uiHelpers } from '@/core/utils/ui-helper'
import { computed, reactive, ref } from 'vue'

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
        createdAt: new Date('2024-05-08'),
      },
    ],
    [
      173482,
      {
        name: 'Chatbot AI Article Generator',
        status: 'published',
        createdAt: new Date('2024-02-19'),
      },
    ],
    [
      173406,
      {
        name: 'Makati Event Ads',
        status: 'published',
        createdAt: new Date('2024-02-14'),
      },
    ],
    [
      172677,
      {
        name: 'Timegap Test 2024',
        status: 'published',
        createdAt: new Date('2024-01-06'),
      },
    ],
    [
      171319,
      {
        name: 'Food Ordering Bot',
        status: 'published',
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

// CREATE/EDIT FLOW
interface CreateOrEditFlowModal extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; flowId: Flow['id'] }): void

  editFlowId: Flow['id'] | null
  intent: 'create' | 'edit' | null
  form: Omit<Flow, 'id'>
  submitForm(): void
  createFlow(): void
  editFlow(): void
}

const createOrEditFlowModal = reactive<CreateOrEditFlowModal>({
  isOpen: false,
  intent: null,
  editFlowId: null,
  form: {
    name: '',
    status: 'disabled',
    createdAt: new Date(),
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.editFlowId = null
    this.form = {
      name: '',
      status: 'disabled',
      createdAt: new Date(),
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      const flow = flows.value.get(args.flowId)
      if (!flow) throw new Error('Flow not found')

      this.editFlowId = args.flowId
      this.form = { ...flow }
    }

    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  submitForm() {
    this.intent === 'create' ? this.createFlow() : this.editFlow()
    this.close()
  },
  createFlow() {
    // @temporary: get the highest flow id and increment it by 1
    const newFlowId = Math.max(...Array.from(flows.value.keys())) + 1
    flows.value.set(newFlowId, { ...this.form, createdAt: new Date() })
  },
  editFlow() {
    if (!this.editFlowId) throw new Error('No Flow ID value')

    flows.value.set(this.editFlowId, { ...this.form })
  },
})

// TOGGLE FLOW STATUS
function handleToggleFlowStatus(flowId: Flow['id']) {
  const flow = flows.value.get(flowId)
  if (!flow) throw new Error('Flow not found')

  flows.value.set(flowId, {
    ...flow,
    status: flow.status === 'published' ? 'disabled' : 'published',
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

// DELETE FLOW
interface DeleteFlowModal extends Omit<Modal, 'open'> {
  flowId: Flow['id'] | null
  open(flowId: Flow['id']): void
  deleteFlow(): void
}

const deleteFlowModal = reactive<DeleteFlowModal>({
  isOpen: false,
  flowId: null,
  initialState() {
    this.isOpen = false
    this.flowId = null
  },
  open(flowId) {
    this.isOpen = true
    this.flowId = flowId
  },
  close() {
    this.initialState()
  },
  deleteFlow() {
    if (!this.flowId) throw new Error('No Flow ID provided')

    const flow = flows.value.get(this.flowId)
    if (!flow) throw new Error('Flow not found')

    flows.value.delete(this.flowId)
    this.close()
  },
})
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Chatbot Flow Builder</template>
      <Button class="gap-x-2 self-end" @click="createOrEditFlowModal.open({ intent: 'create' })">
        <i class="bx bx-plus text-xl" />
        Create Messenger Flow
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flow Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Created</TableHead>
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
                    <DropdownMenuItem class="gap-x-3" @click="handleCloneFlow(id)">
                      <i class="bx bx-copy text-xl" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3">
                      <i class="bx bx-share-alt text-xl" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="gap-x-3"
                      @click="createOrEditFlowModal.open({ intent: 'edit', flowId: id })"
                    >
                      <i class="bx bx-edit text-xl" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem class="gap-x-3" @click="deleteFlowModal.open(id)">
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

    <!-- CREATE/EDIT FLOW MODAL -->
    <Dialog
      v-model:open="createOrEditFlowModal.isOpen"
      @update:open="createOrEditFlowModal.close()"
    >
      <DialogContent class="gap-y-8">
        <DialogHeader>
          <DialogTitle v-if="createOrEditFlowModal.intent === 'create'"> Create Flow </DialogTitle>
          <DialogTitle v-else-if="createOrEditFlowModal.intent === 'edit'"> Edit Flow </DialogTitle>
          <DialogDescription v-if="createOrEditFlowModal.intent === 'create'">
            Enter the flow details to create a new flow.
          </DialogDescription>
          <DialogDescription v-else-if="createOrEditFlowModal.intent === 'edit'">
            Enter the flow details to edit this flow.
          </DialogDescription>
        </DialogHeader>
        <form
          id="flowForm"
          class="flex flex-col gap-y-4"
          @submit.prevent="createOrEditFlowModal.submitForm()"
        >
          <div class="flex flex-col gap-y-2">
            <Label for="name">Name</Label>
            <Input
              type="text"
              id="name"
              v-model="createOrEditFlowModal.form.name"
              name="name"
              placeholder="Input Name"
              required
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="secondary" @click="createOrEditFlowModal.close()">Cancel</Button>
          <Button v-if="createOrEditFlowModal.intent === 'create'" type="submit" form="flowForm">
            Create
          </Button>
          <Button v-else-if="createOrEditFlowModal.intent === 'edit'" type="submit" form="flowForm">
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirm Delete Modal -->
    <Dialog v-model:open="deleteFlowModal.isOpen" @update:open="deleteFlowModal.close()">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Flow?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this flow? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" @click="deleteFlowModal.close()">Cancel</Button>
          <Button variant="destructive" @click="deleteFlowModal.deleteFlow()"> Delete </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DefaultLayout>
</template>

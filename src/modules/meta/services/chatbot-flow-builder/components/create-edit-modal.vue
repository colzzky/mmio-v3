<script setup lang="ts">
import type { Flow, FlowsMap } from '../page.vue'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import type { Modal } from '@/core/utils/types'
import { inject, reactive } from 'vue'

const flows = inject('flows') as FlowsMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; flowId: Flow['id'] }): void

  intent: 'create' | 'edit' | null
  form: Omit<Flow, 'status' | 'createdAt'>
  submitForm(): void
  createFlow(): void
  editFlow(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  form: {
    id: 0,
    name: '',
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.form = {
      id: 0,
      name: '',
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      const flow = flows.value.get(args.flowId)
      if (!flow) throw new Error('Flow not found')

      this.form = {
        id: flow.id,
        name: flow.name,
      }
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
    flows.value.set(newFlowId, {
      ...this.form,
      id: newFlowId,
      status: 'inactive',
      createdAt: new Date(),
    })
  },
  editFlow() {
    const flow = flows.value.get(this.form.id)
    if (!flow) throw new Error('Flow not found')

    flows.value.set(this.form.id, {
      ...this.form,
      status: flow.status,
      createdAt: flow.createdAt,
    })
  },
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="gap-y-8">
      <DialogHeader>
        <template v-if="modal.intent === 'create'">
          <DialogTitle>Create Flow</DialogTitle>
          <DialogDescription> Enter the flow details to create a new flow. </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Edit Flow</DialogTitle>
          <DialogDescription> Enter the flow details to edit this flow. </DialogDescription>
        </template>
      </DialogHeader>
      <form id="form" class="flex flex-col gap-y-4" @submit.prevent="modal.submitForm()">
        <div class="flex flex-col gap-y-2">
          <Label for="name">Name</Label>
          <Input
            type="text"
            id="name"
            v-model="modal.form.name"
            name="name"
            placeholder="Input Name"
            required
          />
        </div>
      </form>
      <DialogFooter>
        <Button variant="secondary" @click="modal.close()">Cancel</Button>
        <Button type="submit" form="form">
          {{ modal.intent === 'create' ? 'Create' : 'Edit' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

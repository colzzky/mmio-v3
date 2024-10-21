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

  flowId: Flow['id'] | null
  intent: 'create' | 'edit' | null
  form: Pick<Flow, 'name'>
  submitForm(): void
  createFlow(): void
  editFlow(): void
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  flowId: null,
  form: {
    name: '',
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.flowId = null
    this.form = {
      name: '',
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'edit') {
      const flow = flows.value.get(args.flowId)
      if (!flow) throw new Error('Flow not found')

      this.flowId = args.flowId
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
    flows.value.set(newFlowId, {
      ...this.form,
      status: 'disabled',
      createdAt: new Date(),
    })
  },
  editFlow() {
    if (!this.flowId) throw new Error('No Flow ID value')

    const flow = flows.value.get(this.flowId)
    if (!flow) throw new Error('Flow not found')

    flows.value.set(this.flowId, { ...flow, name: this.form.name })
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
        <DialogTitle v-if="modal.intent === 'create'"> Create Flow </DialogTitle>
        <DialogTitle v-else-if="modal.intent === 'edit'"> Edit Flow </DialogTitle>
        <DialogDescription v-if="modal.intent === 'create'">
          Enter the flow details to create a new flow.
        </DialogDescription>
        <DialogDescription v-else-if="modal.intent === 'edit'">
          Enter the flow details to edit this flow.
        </DialogDescription>
      </DialogHeader>
      <form id="flowForm" class="flex flex-col gap-y-4" @submit.prevent="modal.submitForm()">
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
        <Button v-if="modal.intent === 'create'" type="submit" form="flowForm"> Create </Button>
        <Button v-else-if="modal.intent === 'edit'" type="submit" form="flowForm"> Edit </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

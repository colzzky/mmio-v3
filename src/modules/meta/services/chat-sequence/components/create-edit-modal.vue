<script setup lang="ts">
import type { Sequence, SequencesMap } from '../page.vue'
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

const sequences = inject('sequences') as SequencesMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create' } | { intent: 'edit'; sequenceId: Sequence['id'] }): void

  intent: 'create' | 'edit' | null
  form: Omit<Sequence, 'createdAt'>
  submitForm(): void
  createSequence(): void
  editSequence(): void
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
    this.isOpen = true

    if (args.intent === 'edit') {
      const sequence = sequences.value.get(args.sequenceId)
      if (!sequence) throw new Error('Chat Sequence not found')

      this.form = {
        id: sequence.id,
        name: sequence.name,
      }
    }

    this.intent = args.intent
  },
  close() {
    this.initialState()
  },
  submitForm() {
    this.intent === 'create' ? this.createSequence() : this.editSequence()
    this.close()
  },
  createSequence() {
    // @temporary: get the highest sequence id and increment it by 1
    const newSequenceId = Math.max(...Array.from(sequences.value.keys())) + 1
    sequences.value.set(newSequenceId, {
      ...this.form,
      id: newSequenceId,
      createdAt: new Date(),
    })
  },
  editSequence() {
    const sequence = sequences.value.get(this.form.id)
    if (!sequence) throw new Error('Chat Sequence not found')

    sequences.value.set(this.form.id, {
      ...this.form,
      createdAt: sequence.createdAt,
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
          <DialogTitle>Create Chat Sequence</DialogTitle>
          <DialogDescription>
            Enter the chat sequence details to create a new chat sequence.
          </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Edit Chat Sequence</DialogTitle>
          <DialogDescription>
            Enter the chat sequence details to edit this chat sequence.
          </DialogDescription>
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

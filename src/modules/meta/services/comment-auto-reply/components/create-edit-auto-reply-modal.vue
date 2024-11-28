<script setup lang="ts">
import type { AutoReply, AutoReplyMap, Post } from '../page.vue'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import type { Modal } from '@/core/utils/types'
import { inject, reactive } from 'vue'

const autoReplies = inject('autoReplies') as AutoReplyMap

interface ModalInterface extends Omit<Modal, 'open'> {
  open(
    args:
      | { intent: 'create'; postId: Post['id'] }
      | { intent: 'edit'; autoReplyId: AutoReply['id'] },
  ): void

  intent: 'create' | 'edit' | null
  form: Omit<AutoReply, 'status' | 'createdAt' | 'updatedAt'>
  submitForm(): void
  createAutoReply(): void
  editAutoReply(): void
}
const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  form: {
    id: 0,
    postId: 0,
    name: '',
  },
  initialState() {
    this.isOpen = false
    this.intent = null
    this.form = {
      id: 0,
      postId: 0,
      name: '',
    }
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'create') {
      this.form.postId = args.postId
    } else if (args.intent === 'edit') {
      const autoReply = autoReplies.value.get(args.autoReplyId)
      if (!autoReply) throw new Error('Auto reply not found')

      this.form = {
        id: autoReply.id,
        postId: autoReply.postId,
        name: autoReply.name,
      }
    }
    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  submitForm() {
    this.intent === 'create' ? this.createAutoReply() : this.editAutoReply()
    this.close()
  },
  createAutoReply() {
    // @temporary: get the highest auto reply id and increment it by 1
    const newAutoReplyId = Math.max(...Array.from(autoReplies.value.keys())) + 1
    autoReplies.value.set(newAutoReplyId, {
      ...this.form,
      id: newAutoReplyId,
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },
  editAutoReply() {
    const autoReply = autoReplies.value.get(this.form.id)
    if (!autoReply) throw new Error('Auto reply not found')

    autoReplies.value.set(this.form.id, {
      ...this.form,
      status: autoReply.status,
      createdAt: autoReply.createdAt,
      updatedAt: new Date(),
    })
  },
})

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent>
      <DialogHeader>
        <template v-if="modal.intent === 'create'">
          <DialogTitle>Create Auto Reply</DialogTitle>
          <DialogDescription> Enter the details to create a new auto reply </DialogDescription>
        </template>
        <template v-else>
          <DialogTitle>Edit Auto Reply</DialogTitle>
          <DialogDescription> Enter the details to edit this auto reply </DialogDescription>
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

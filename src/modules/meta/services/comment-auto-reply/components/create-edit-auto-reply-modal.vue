<script setup lang="ts">
import type { AutoReply, Post } from '../page.vue'
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
import { reactive } from 'vue'

interface ModalInterface extends Omit<Modal, 'open'> {
  open(args: { intent: 'create'; post: Omit<Post, 'id'> }): void

  intent: 'create' | 'edit' | null
  form: Pick<AutoReply, 'name'>
  post: Omit<Post, 'id'> | null
  submitForm(): void
  createAutoReply(): void
  editAutoReply(): void
}
const modal = reactive<ModalInterface>({
  isOpen: false,
  intent: null,
  form: {
    name: '',
  },
  post: null,
  initialState() {
    this.isOpen = false
    this.intent = null
    this.form = {
      name: '',
    }
    this.post = null
  },
  open(args) {
    this.intent = args.intent

    if (args.intent === 'create') {
      this.post = args.post
    }

    // if (args.intent === 'edit') {
    //   const flow = flows.value.get(args.autoReplyId)
    //   if (!flow) throw new Error('Flow not found')

    //   this.editAutoReplyId = args.autoReplyId
    //   this.form = { ...flow }
    // }

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
    const post = this.post
    if (!post) throw new Error('Facebook post not found')

    // @temporary: get the highest auto reply id and increment it by 1
    const newAutoReplyId = Math.max(...Array.from(post.autoReplies.keys())) + 1
    post.autoReplies.set(newAutoReplyId, {
      ...this.form,
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },
  editAutoReply() {},
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
      <form id="autoReplyForm" class="flex flex-col gap-y-4" @submit.prevent="modal.submitForm()">
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
        <Button v-if="modal.intent === 'create'" type="submit" form="autoReplyForm">
          Create
        </Button>
        <Button v-else-if="modal.intent === 'edit'" type="submit" form="autoReplyForm">
          Edit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Post } from '../page.vue'
import { AspectRatio } from '@/core/components/ui/aspect-ratio'
import { Avatar, AvatarImage } from '@/core/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
import type { Modal } from '@/core/utils/types'
import { reactive } from 'vue'

interface ModalInterface extends Omit<Modal, 'open'> {
  open(post: Post): void

  post: Post | null
}
const modal = reactive<ModalInterface>({
  isOpen: false,
  post: null,
  initialState() {
    this.isOpen = false
    this.post = null
  },
  open(post) {
    this.isOpen = true
    this.post = post
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
    <DialogContent class="max-w-md">
      <DialogHeader class="flex flex-col gap-y-2">
        <DialogTitle>View Post</DialogTitle>
        <DialogDescription
          class="grid grid-cols-[var(--avatar-size),1fr] items-center gap-x-2 text-xs [--avatar-size:theme(spacing.8)]"
        >
          <Avatar class="row-span-2 size-[var(--avatar-size)]">
            <AvatarImage :src="modal.post?.user.image ?? ''"></AvatarImage>
          </Avatar>
          <span>{{ modal.post?.user.name }}</span>
          <a
            :href="`http://example.com/${modal.post?.id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="self-start text-blue-500 hover:underline"
          >
            Post ID: {{ modal.post?.id }}
          </a>
        </DialogDescription>
      </DialogHeader>
      <section class="flex flex-col gap-y-4 text-sm">
        <p class="text-pretty">{{ modal.post?.description }}</p>
        <AspectRatio :ratio="16 / 9">
          <img :src="modal.post?.image" class="h-full w-full rounded-md object-cover" />
        </AspectRatio>
        <div class="flex items-center gap-x-4 text-muted-foreground">
          <span>{{ modal.post?.likes }} Likes</span>
          <span>{{ modal.post?.comments }} Comment</span>
          <span>{{ modal.post?.shares }} Shares</span>
          <span class="grow text-end">
            {{ modal.post?.createdAt.toLocaleDateString() }}
          </span>
        </div>
      </section>
    </DialogContent>
  </Dialog>
</template>

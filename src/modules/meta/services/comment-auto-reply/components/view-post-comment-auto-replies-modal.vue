<script setup lang="ts">
import type { AutoRepliesByIdArray, AutoReply, Post } from '../page.vue'
import { AspectRatio } from '@/core/components/ui/aspect-ratio'
import { Avatar, AvatarImage } from '@/core/components/ui/avatar'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'
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
import { inject, reactive } from 'vue'

const autoRepliesByPostId = inject('autoRepliesByPostId') as AutoRepliesByIdArray

interface ModalInterface extends Omit<Modal, 'open'> {
  open(post: Post): void

  post: Post | undefined
}

const modal = reactive<ModalInterface>({
  isOpen: false,
  post: undefined,
  initialState() {
    this.isOpen = false
    this.post = undefined
  },
  open(post) {
    this.isOpen = true
    this.post = post
  },
  close() {
    this.initialState()
  },
})

const emits = defineEmits<{
  addAutoReplyClick: [postId: Post['id']]
  toggleButtonClick: [autoReplyId: AutoReply['id']]
  editAutoReplyClick: [autoReplyId: AutoReply['id']]
}>()

defineExpose({
  modal,
})
</script>

<template>
  <Dialog v-model:open="modal.isOpen" @update:open="modal.close()">
    <DialogContent class="flex max-w-screen-xl flex-col">
      <DialogHeader class="flex flex-col gap-y-2">
        <DialogTitle>View Post Comment Auto Replies</DialogTitle>

        <DialogDescription class="flex items-center justify-between">
          <div
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
          </div>
          <Button
            v-if="modal.post"
            class="gap-x-2 self-end"
            size="sm"
            @click="emits('addAutoReplyClick', modal.post.id)"
          >
            <i class="bx bx-plus text-xl" />
            Add Comment Auto Reply
          </Button>
        </DialogDescription>
      </DialogHeader>

      <section class="grid grid-cols-[33%_1fr] gap-x-8">
        <div class="flex flex-col gap-y-4 self-start rounded-md border p-6 text-sm">
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
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead class="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody v-if="modal.post">
              <TableRow
                v-for="autoReply in autoRepliesByPostId.get(modal.post.id)"
                :key="autoReply.id"
              >
                <TableCell>{{ autoReply.name }}</TableCell>
                <TableCell>
                  <Badge>{{ uiHelpers.toTitleCase(autoReply.status) }}</Badge>
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  {{ uiHelpers.formatDateTimeAgo(autoReply.createdAt.toDateString()) }}
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  {{ uiHelpers.formatDateTimeAgo(autoReply.updatedAt.toDateString()) }}
                </TableCell>
                <TableCell>
                  <div class="grid place-content-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <i class="material-icons text-md">more_vert</i>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          v-if="modal.post"
                          class="gap-x-3"
                          @click="emits('toggleButtonClick', autoReply.id)"
                        >
                          <i
                            :class="[
                              'bx text-xl',
                              autoReply.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                            ]"
                          />
                          Toggle Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          v-if="modal.post"
                          class="gap-x-3"
                          @click="emits('editAutoReplyClick', autoReply.id)"
                        >
                          <i class="bx bx-edit text-xl" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </DialogContent>
  </Dialog>
</template>

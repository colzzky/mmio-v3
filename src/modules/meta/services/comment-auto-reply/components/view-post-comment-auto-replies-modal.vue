<script setup lang="ts">
import type { FacebookPost } from '../page.vue'
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
import { uiHelpers } from '@/core/utils/ui-helper'
import { useForwardPropsEmits, type DialogRootEmits, type DialogRootProps } from 'radix-vue'

const props = defineProps<DialogRootProps & { post: FacebookPost | null }>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <Dialog v-bind="forwarded">
    <DialogContent class="flex max-w-screen-xl flex-col">
      <DialogHeader class="flex flex-col gap-y-2">
        <DialogTitle>View Post Comment Auto Replies</DialogTitle>
        <DialogDescription class="flex items-center justify-between">
          <div
            class="grid grid-cols-[var(--avatar-size),1fr] items-center gap-x-2 text-xs [--avatar-size:theme(spacing.8)]"
          >
            <Avatar class="row-span-2 size-[var(--avatar-size)]">
              <AvatarImage :src="post?.user.image ?? ''"></AvatarImage>
            </Avatar>
            <span>{{ post?.user.name }}</span>
            <a
              :href="`http://example.com/${post?.id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="self-start text-blue-500 hover:underline"
            >
              Post ID: {{ post?.id }}
            </a>
          </div>
          <Button class="gap-x-2 self-end" size="sm" disabled>
            <i class="bx bx-plus text-xl" />
            Add Comment Auto Reply
          </Button>
        </DialogDescription>
      </DialogHeader>

      <section class="grid grid-cols-[33%_1fr] gap-x-4">
        <div class="flex flex-col gap-y-4 rounded-md border p-6 text-sm">
          <p class="text-pretty">{{ post?.description }}</p>
          <AspectRatio :ratio="16 / 9">
            <img :src="post?.image" class="h-full w-full rounded-md object-cover" />
          </AspectRatio>
          <div class="flex items-center gap-x-4 text-muted-foreground">
            <span>{{ post?.likes }} Likes</span>
            <span>{{ post?.comments }} Comment</span>
            <span>{{ post?.shares }} Shares</span>
            <span class="grow text-end">
              {{ post?.created.toLocaleDateString() }}
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
            <TableBody>
              <TableRow v-for="[id, autoReply] in post?.autoReplies" :key="id">
                <TableCell>{{ autoReply.name }}</TableCell>
                <TableCell>
                  <Badge>{{ uiHelpers.toTitleCase(autoReply.status) }}</Badge>
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  {{ uiHelpers.formatDateTimeAgo(autoReply.created.toDateString()) }}
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  {{ uiHelpers.formatDateTimeAgo(autoReply.updated.toDateString()) }}
                </TableCell>
                <TableCell>
                  <div class="grid place-content-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <i class="material-icons text-md">more_vert</i>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem class="gap-x-3" disabled>
                          <i
                            :class="[
                              'bx text-xl',
                              autoReply.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                            ]"
                          />
                          Toggle Status
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-x-3" disabled>
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

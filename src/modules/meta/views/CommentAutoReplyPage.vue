<script setup lang="ts">
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/core/components/ui/dropdown-menu'
import Main from '@/core/components/ui/main.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import DefaultLayout from '@/core/layouts/DefaultLayout.vue'
import type { Modal } from '@/core/utils/types'
import { uiHelpers } from '@/core/utils/ui-helper'
import { reactive, ref } from 'vue'

type AutoReply = {
  id: number
  name: string
  status: 'active' | 'inactive'
  created: Date
  updated: Date
}

type FacebookPost = {
  id: number
  user: {
    name: string
    image: string
  }
  description: string
  created: Date
  image?: string
  likes: number
  comments: number
  shares: number
  autoReplies: Map<AutoReply['id'], Omit<AutoReply, 'id'>>
}

const facebookPosts = ref(
  new Map<FacebookPost['id'], Omit<FacebookPost, 'id'>>([
    [
      1,
      {
        user: {
          name: 'Alice Johnson',
          image: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
        description: 'Had an amazing time hiking up the mountains! 🏞️ #NatureLover #Adventure',
        created: new Date('2023-10-15'),
        image: 'https://picsum.photos/600/400?random=1',
        likes: 120,
        comments: 2,
        shares: 15,
        autoReplies: new Map([
          [
            1,
            {
              name: 'Auto Reply #1 for Alice Johnson',
              status: 'active',
              created: new Date('2023-10-16'),
              updated: new Date('2023-10-16'),
            },
          ],
          [
            2,
            {
              name: 'Auto Reply #2 for Alice Johnson',
              status: 'active',
              created: new Date('2023-10-17'),
              updated: new Date('2023-10-17'),
            },
          ],
          [
            3,
            {
              name: 'Auto Reply #3 for Alice Johnson',
              status: 'inactive',
              created: new Date('2023-10-18'),
              updated: new Date('2023-10-18'),
            },
          ],
        ]),
      },
    ],
    [
      2,
      {
        user: {
          name: 'Bob Smith',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        description:
          'Just finished baking these delicious cookies 🍪 Who wants some? 😋 #BakingLove',
        created: new Date('2023-10-14'),
        image: 'https://picsum.photos/600/400?random=2',
        likes: 85,
        comments: 1,
        shares: 8,
        autoReplies: new Map([
          [
            4,
            {
              name: 'Auto Reply #1 for Bob Smith',
              status: 'active',
              created: new Date('2023-10-15'),
              updated: new Date('2023-10-15'),
            },
          ],
          [
            5,
            {
              name: 'Auto Reply #2 for Bob Smith',
              status: 'active',
              created: new Date('2023-10-16'),
              updated: new Date('2023-10-16'),
            },
          ],
          [
            6,
            {
              name: 'Auto Reply #3 for Bob Smith',
              status: 'inactive',
              created: new Date('2023-10-17'),
              updated: new Date('2023-10-17'),
            },
          ],
        ]),
      },
    ],
    [
      3,
      {
        user: {
          name: 'Charlie Green',
          image: 'https://randomuser.me/api/portraits/men/2.jpg',
        },
        description:
          "Throwback to last summer at the beach. Can't wait to go back! 🏖️ #SummerVibes",
        created: new Date('2023-10-13'),
        image: 'https://picsum.photos/600/400?random=3',
        likes: 200,
        comments: 1,
        shares: 10,
        autoReplies: new Map([
          [
            7,
            {
              name: 'Auto Reply #1 for Charlie Green',
              status: 'active',
              created: new Date('2023-10-14'),
              updated: new Date('2023-10-14'),
            },
          ],
          [
            8,
            {
              name: 'Auto Reply #2 for Charlie Green',
              status: 'active',
              created: new Date('2023-10-15'),
              updated: new Date('2023-10-15'),
            },
          ],
          [
            9,
            {
              name: 'Auto Reply #3 for Charlie Green',
              status: 'inactive',
              created: new Date('2023-10-16'),
              updated: new Date('2023-10-16'),
            },
          ],
        ]),
      },
    ],
  ]),
)

// VIEW POST MODAL
interface ViewPostModal extends Omit<Modal, 'open'> {
  post: FacebookPost | null
  open(post: FacebookPost): void
}

const viewPostModal = reactive<ViewPostModal>({
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

// VIEW POST COMMENT AUTO REPLY
interface ViewPostCommentAutoReplyModal extends ViewPostModal {}

const viewPostCommentAutoReplyModal = reactive<ViewPostCommentAutoReplyModal>({
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
</script>

<template>
  <DefaultLayout>
    <Main class="flex flex-col gap-y-4">
      <template #heading>Comment Auto Reply</template>
      <Tabs default-value="posts" class="flex flex-col gap-y-2">
        <TabsList class="self-start">
          <TabsTrigger value="posts">All Posts</TabsTrigger>
          <TabsTrigger value="autoReplies">Auto Replies</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Created</TableHead>
                <TableHead># Auto Replies</TableHead>
                <TableHead class="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="[id, post] in facebookPosts" :key="id">
                <TableCell>
                  <div class="flex items-center justify-center gap-x-2">
                    <Avatar class="size-9">
                      <AvatarImage :src="post.user.image" />
                    </Avatar>
                    <a
                      :href="`http://example.com/${id}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-500 hover:underline"
                    >
                      #{{ id }}
                    </a>
                  </div>
                </TableCell>
                <TableCell class="w-full max-w-px overflow-hidden text-ellipsis whitespace-nowrap">
                  {{ post.description }}
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  {{ uiHelpers.formatDateTimeAgo(post.created.toDateString()) }}
                </TableCell>
                <TableCell>{{ post.autoReplies.size }}</TableCell>
                <TableCell>
                  <div class="grid place-content-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <i class="material-icons text-md">more_vert</i>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Post</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="viewPostModal.open({ id, ...post })"
                        >
                          <i class="bx bx-show text-xl"></i>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Auto Reply</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="viewPostCommentAutoReplyModal.open({ id, ...post })"
                        >
                          <i class="bx bx-list-ul text-xl"></i>
                          View All
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-x-3">
                          <i class="bx bx-message-square-add text-xl"></i>
                          Create
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-x-3">
                          <i class="bx bx-play-circle text-xl"></i>
                          Activate All
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-x-3">
                          <i class="bx bx-pause-circle text-xl"></i>
                          Deactivate All
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="autoReplies"> autoReplies </TabsContent>
      </Tabs>
    </Main>

    <!-- VIEW POST COMMENT AUTO REPLY MODAL -->
    <Dialog
      v-model:open="viewPostCommentAutoReplyModal.isOpen"
      @update:open="viewPostCommentAutoReplyModal.close()"
    >
      <DialogContent class="flex max-w-screen-xl flex-col">
        <DialogHeader class="flex flex-col gap-y-2">
          <DialogTitle>View Post Comment Auto Replies</DialogTitle>
          <DialogDescription class="flex items-center justify-between">
            <div
              class="grid grid-cols-[var(--avatar-size),1fr] items-center gap-x-2 text-xs [--avatar-size:theme(spacing.8)]"
            >
              <Avatar class="row-span-2 size-[var(--avatar-size)]">
                <AvatarImage
                  :src="viewPostCommentAutoReplyModal.post?.user.image ?? ''"
                ></AvatarImage>
              </Avatar>
              <span>{{ viewPostCommentAutoReplyModal.post?.user.name }}</span>
              <a
                :href="`http://example.com/${viewPostCommentAutoReplyModal.post?.id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="self-start text-blue-500 hover:underline"
              >
                Post ID: {{ viewPostCommentAutoReplyModal.post?.id }}
              </a>
            </div>
            <Button class="gap-x-2 self-end" size="sm">
              <i class="bx bx-plus text-xl" />
              Add Comment Auto Reply
            </Button>
          </DialogDescription>
        </DialogHeader>

        <section class="grid grid-cols-[33%_1fr] gap-x-4">
          <div class="flex flex-col gap-y-4 rounded-md border p-6 text-sm">
            <p class="text-pretty">{{ viewPostCommentAutoReplyModal.post?.description }}</p>
            <AspectRatio :ratio="16 / 9">
              <img
                :src="viewPostCommentAutoReplyModal.post?.image"
                class="h-full w-full rounded-md object-cover"
              />
            </AspectRatio>
            <div class="flex items-center gap-x-4 text-muted-foreground">
              <span>{{ viewPostCommentAutoReplyModal.post?.likes }} Likes</span>
              <span>{{ viewPostCommentAutoReplyModal.post?.comments }} Comment</span>
              <span>{{ viewPostCommentAutoReplyModal.post?.shares }} Shares</span>
              <span class="grow text-end">
                {{ viewPostCommentAutoReplyModal.post?.created.toLocaleDateString() }}
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
                <TableRow
                  v-for="[id, autoReply] in viewPostCommentAutoReplyModal.post?.autoReplies"
                  :key="id"
                >
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
                          <DropdownMenuItem class="gap-x-3">
                            <i
                              :class="[
                                'bx text-xl',
                                autoReply.status === 'active'
                                  ? 'bx-toggle-left'
                                  : 'bxs-toggle-right',
                              ]"
                            />
                            Toggle Status
                          </DropdownMenuItem>
                          <DropdownMenuItem class="gap-x-3">
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

    <!-- VIEW POST MODAL -->
    <Dialog v-model:open="viewPostModal.isOpen" @update:open="viewPostModal.close()">
      <DialogContent class="max-w-md">
        <DialogHeader class="flex flex-col gap-y-2">
          <DialogTitle>View Post</DialogTitle>
          <DialogDescription
            class="grid grid-cols-[var(--avatar-size),1fr] items-center gap-x-2 text-xs [--avatar-size:theme(spacing.8)]"
          >
            <Avatar class="row-span-2 size-[var(--avatar-size)]">
              <AvatarImage :src="viewPostModal.post?.user.image ?? ''"></AvatarImage>
            </Avatar>
            <span>{{ viewPostModal.post?.user.name }}</span>
            <a
              :href="`http://example.com/${viewPostModal.post?.id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="self-start text-blue-500 hover:underline"
            >
              Post ID: {{ viewPostModal.post?.id }}
            </a>
          </DialogDescription>
        </DialogHeader>
        <section class="flex flex-col gap-y-4 text-sm">
          <p class="text-pretty">{{ viewPostModal.post?.description }}</p>
          <AspectRatio :ratio="16 / 9">
            <img :src="viewPostModal.post?.image" class="h-full w-full rounded-md object-cover" />
          </AspectRatio>
          <div class="flex items-center gap-x-4 text-muted-foreground">
            <span>{{ viewPostModal.post?.likes }} Likes</span>
            <span>{{ viewPostModal.post?.comments }} Comment</span>
            <span>{{ viewPostModal.post?.shares }} Shares</span>
            <span class="grow text-end">
              {{ viewPostModal.post?.created.toLocaleDateString() }}
            </span>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  </DefaultLayout>
</template>

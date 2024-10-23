<script setup lang="ts">
import CreateEditAutoReplyModal from './components/create-edit-auto-reply-modal.vue'
import ViewPostCommentAutoRepliesModal from './components/view-post-comment-auto-replies-modal.vue'
import ViewPostModal from './components/view-post-modal.vue'
import { Avatar, AvatarImage } from '@/core/components/ui/avatar'
import { Badge } from '@/core/components/ui/badge'
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
import { uiHelpers } from '@/core/utils/ui-helper'
import { computed, provide, ref, useTemplateRef } from 'vue'

// @temporary: can be extracted to another file
export type AutoReply = {
  id: number
  postId: Post['id']
  name: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

// @temporary: can be extracted to another file
export type Post = {
  id: number
  user: {
    name: string
    image: string
  }
  description: string
  createdAt: Date
  image?: string
  likes: number
  comments: number
  shares: number
}

const posts = ref(
  new Map<Post['id'], Post>([
    [
      1,
      {
        id: 1,
        description: 'Had an amazing time hiking up the mountains! 🏞️ #NatureLover #Adventure',
        createdAt: new Date('2023-10-15'),
        image: 'https://picsum.photos/600/400?random=1',
        likes: 120,
        comments: 2,
        shares: 15,
        user: {
          name: 'Alice Johnson',
          image: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
      },
    ],
    [
      2,
      {
        id: 2,
        description:
          'Just finished baking these delicious cookies 🍪 Who wants some? 😋 #BakingLove',
        createdAt: new Date('2023-10-14'),
        image: 'https://picsum.photos/600/400?random=2',
        likes: 85,
        comments: 1,
        shares: 8,
        user: {
          name: 'Bob Smith',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
      },
    ],
    [
      3,
      {
        id: 3,
        description:
          "Throwback to last summer at the beach. Can't wait to go back! 🏖️ #SummerVibes",
        createdAt: new Date('2023-10-13'),
        image: 'https://picsum.photos/600/400?random=3',
        likes: 200,
        comments: 1,
        shares: 10,
        user: {
          name: 'Charlie Green',
          image: 'https://randomuser.me/api/portraits/men/2.jpg',
        },
      },
    ],
  ]),
)

export type PostsMap = typeof posts
provide('posts', posts)

const autoReplies = ref(
  new Map<AutoReply['id'], AutoReply>([
    [
      1,
      {
        id: 1,
        postId: 1,
        name: 'Auto Reply #1 for Alice Johnson',
        status: 'active',
        createdAt: new Date('2023-10-16'),
        updatedAt: new Date('2023-10-16'),
      },
    ],
    [
      2,
      {
        id: 2,
        postId: 1,
        name: 'Auto Reply #2 for Alice Johnson',
        status: 'active',
        createdAt: new Date('2023-10-17'),
        updatedAt: new Date('2023-10-17'),
      },
    ],
    [
      3,
      {
        id: 3,
        postId: 1,
        name: 'Auto Reply #3 for Alice Johnson',
        status: 'inactive',
        createdAt: new Date('2023-10-18'),
        updatedAt: new Date('2023-10-18'),
      },
    ],
    [
      4,
      {
        id: 4,
        postId: 2,
        name: 'Auto Reply #1 for Bob Smith',
        status: 'active',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15'),
      },
    ],
    [
      5,
      {
        id: 5,
        postId: 2,
        name: 'Auto Reply #2 for Bob Smith',
        status: 'active',
        createdAt: new Date('2023-10-16'),
        updatedAt: new Date('2023-10-16'),
      },
    ],
    [
      6,
      {
        id: 6,
        postId: 2,
        name: 'Auto Reply #3 for Bob Smith',
        status: 'inactive',
        createdAt: new Date('2023-10-17'),
        updatedAt: new Date('2023-10-17'),
      },
    ],
    [
      7,
      {
        id: 7,
        postId: 3,
        name: 'Auto Reply #1 for Charlie Green',
        status: 'active',
        createdAt: new Date('2023-10-14'),
        updatedAt: new Date('2023-10-14'),
      },
    ],
    [
      8,
      {
        id: 8,
        postId: 3,
        name: 'Auto Reply #2 for Charlie Green',
        status: 'active',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15'),
      },
    ],
    [
      9,
      {
        id: 9,
        postId: 3,
        name: 'Auto Reply #3 for Charlie Green',
        status: 'inactive',
        createdAt: new Date('2023-10-16'),
        updatedAt: new Date('2023-10-16'),
      },
    ],
  ]),
)

export type AutoReplyMap = typeof autoReplies
provide('autoReplies', autoReplies)

const autoRepliesByPostId = computed(() =>
  // @ts-ignore
  Map.groupBy(autoReplies.value.values(), ({ postId }: AutoReply) => postId),
)
export type AutoRepliesByIdArray = typeof autoRepliesByPostId
provide('autoRepliesByPostId', autoRepliesByPostId)

function toggleAutoReplyStatus(autoReplyId: AutoReply['id']) {
  const autoReply = autoReplies.value.get(autoReplyId)
  if (!autoReply) throw new Error('Auto reply not found')

  autoReplies.value.set(autoReplyId, {
    ...autoReply,
    status: autoReply.status === 'active' ? 'inactive' : 'active',
  })
}

// ACTIVATE/DEACTIVATE ALL AUTO REPLIES
function toggleAllAutoRepliesStatus({
  postId,
  intent,
}: {
  postId: Post['id']
  intent: 'activate' | 'deactivate'
}) {
  autoReplies.value.forEach((autoReply) => {
    if (postId !== autoReply.postId) return

    autoReply.status = intent === 'activate' ? 'active' : 'inactive'
  })
}

const viewPostModalRef = useTemplateRef('viewPostModal')
const viewPostCommentAutoRepliesModalRef = useTemplateRef('viewPostCommentAutoRepliesModal')
const createEditAutoReplyModalRef = useTemplateRef('createEditAutoReplyModal')
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
              <TableRow v-for="[id, post] in posts" :key="id">
                <TableCell class="whitespace-nowrap">
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
                      Post ID: {{ id }}
                    </a>
                  </div>
                </TableCell>
                <TableCell class="w-full max-w-px overflow-hidden text-ellipsis whitespace-nowrap">
                  {{ post.description }}
                </TableCell>
                <TableCell class="whitespace-nowrap">
                  {{ uiHelpers.formatDateTimeAgo(post.createdAt.toDateString()) }}
                </TableCell>
                <TableCell>{{ autoRepliesByPostId.get(id).length }}</TableCell>
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
                          @click="viewPostModalRef?.modal.open(post)"
                        >
                          <i class="bx bx-show text-xl"></i>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Auto Reply</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            createEditAutoReplyModalRef?.modal.open({
                              intent: 'create',
                              postId: id,
                            })
                          "
                        >
                          <i class="bx bx-message-square-add text-xl"></i>
                          Create
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="viewPostCommentAutoRepliesModalRef?.modal.open({ ...post, id })"
                        >
                          <i class="bx bx-list-ul text-xl"></i>
                          View All
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="toggleAllAutoRepliesStatus({ postId: id, intent: 'activate' })"
                        >
                          <i class="bx bx-play-circle text-xl"></i>
                          Activate All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="toggleAllAutoRepliesStatus({ postId: id, intent: 'deactivate' })"
                        >
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
        <TabsContent value="autoReplies">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Post ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead class="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="[id, autoReply] in autoReplies" :key="id">
                <TableCell>{{ id }}</TableCell>
                <TableCell>{{ autoReply.name }}</TableCell>
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-x-2">
                    <Avatar class="size-9">
                      <AvatarImage :src="posts.get(autoReply.postId)?.user.image ?? ''" />
                    </Avatar>
                    <a
                      :href="`http://example.com/${autoReply.postId}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-500 hover:underline"
                    >
                      Post ID: {{ autoReply.postId }}
                    </a>
                  </div>
                </TableCell>
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
                        <DropdownMenuLabel>Auto Reply</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            createEditAutoReplyModalRef?.modal.open({
                              intent: 'edit',
                              autoReplyId: id,
                            })
                          "
                        >
                          <i class="bx bx-edit text-xl" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-x-3" @click="toggleAutoReplyStatus(id)">
                          <i
                            :class="[
                              'bx text-xl',
                              autoReply.status === 'active' ? 'bx-toggle-left' : 'bxs-toggle-right',
                            ]"
                          />
                          Toggle Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Post</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="viewPostModalRef?.modal.open(posts.get(autoReply.postId)!)"
                        >
                          <i class="bx bx-show text-xl"></i>
                          View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </Main>

    <ViewPostModal ref="viewPostModal" />

    <ViewPostCommentAutoRepliesModal
      ref="viewPostCommentAutoRepliesModal"
      @add-auto-reply-click="
        createEditAutoReplyModalRef?.modal.open({
          intent: 'create',
          postId: $event,
        })
      "
      @toggle-button-click="toggleAutoReplyStatus($event)"
      @edit-auto-reply-click="
        createEditAutoReplyModalRef?.modal.open({
          intent: 'edit',
          autoReplyId: $event,
        })
      "
    />

    <CreateEditAutoReplyModal ref="createEditAutoReplyModal" />
  </DefaultLayout>
</template>

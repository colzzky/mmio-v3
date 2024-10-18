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
import { computed, ref, useTemplateRef } from 'vue'

// @temporary: can be extracted to another file
export type AutoReply = {
  id: number
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
  autoReplies: Map<AutoReply['id'], Omit<AutoReply, 'id'>>
}

const posts = ref(
  new Map<Post['id'], Omit<Post, 'id'>>([
    [
      1,
      {
        user: {
          name: 'Alice Johnson',
          image: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
        description: 'Had an amazing time hiking up the mountains! 🏞️ #NatureLover #Adventure',
        createdAt: new Date('2023-10-15'),
        image: 'https://picsum.photos/600/400?random=1',
        likes: 120,
        comments: 2,
        shares: 15,
        autoReplies: new Map([
          [
            101,
            {
              name: 'Auto Reply #1 for Alice Johnson',
              status: 'active',
              createdAt: new Date('2023-10-16'),
              updatedAt: new Date('2023-10-16'),
            },
          ],
          [
            102,
            {
              name: 'Auto Reply #2 for Alice Johnson',
              status: 'active',
              createdAt: new Date('2023-10-17'),
              updatedAt: new Date('2023-10-17'),
            },
          ],
          [
            103,
            {
              name: 'Auto Reply #3 for Alice Johnson',
              status: 'inactive',
              createdAt: new Date('2023-10-18'),
              updatedAt: new Date('2023-10-18'),
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
        createdAt: new Date('2023-10-14'),
        image: 'https://picsum.photos/600/400?random=2',
        likes: 85,
        comments: 1,
        shares: 8,
        autoReplies: new Map([
          [
            201,
            {
              name: 'Auto Reply #1 for Bob Smith',
              status: 'active',
              createdAt: new Date('2023-10-15'),
              updatedAt: new Date('2023-10-15'),
            },
          ],
          [
            202,
            {
              name: 'Auto Reply #2 for Bob Smith',
              status: 'active',
              createdAt: new Date('2023-10-16'),
              updatedAt: new Date('2023-10-16'),
            },
          ],
          [
            203,
            {
              name: 'Auto Reply #3 for Bob Smith',
              status: 'inactive',
              createdAt: new Date('2023-10-17'),
              updatedAt: new Date('2023-10-17'),
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
        createdAt: new Date('2023-10-13'),
        image: 'https://picsum.photos/600/400?random=3',
        likes: 200,
        comments: 1,
        shares: 10,
        autoReplies: new Map([
          [
            301,
            {
              name: 'Auto Reply #1 for Charlie Green',
              status: 'active',
              createdAt: new Date('2023-10-14'),
              updatedAt: new Date('2023-10-14'),
            },
          ],
          [
            302,
            {
              name: 'Auto Reply #2 for Charlie Green',
              status: 'active',
              createdAt: new Date('2023-10-15'),
              updatedAt: new Date('2023-10-15'),
            },
          ],
          [
            303,
            {
              name: 'Auto Reply #3 for Charlie Green',
              status: 'inactive',
              createdAt: new Date('2023-10-16'),
              updatedAt: new Date('2023-10-16'),
            },
          ],
        ]),
      },
    ],
  ]),
)

const allAutoReplies = computed(
  () =>
    new Map(
      Array.from(posts.value.entries()).flatMap(([postId, { autoReplies, ...postRest }]) =>
        Array.from(autoReplies.entries()).map(([autoReplyId, autoReply]) => [
          autoReplyId,
          { ...autoReply, post: { ...postRest, id: postId } },
        ]),
      ),
    ),
)

// TOGGLE AUTO REPLY STATUS
export type ToggleAutoReplyStatusArgs = {
  postId: Post['id']
  autoReplyId: AutoReply['id']
}
function toggleAutoReplyStatus({ postId, autoReplyId }: ToggleAutoReplyStatusArgs) {
  const post = posts.value.get(postId)
  if (!post) throw new Error('Post not found')

  const autoReply = post.autoReplies.get(autoReplyId)
  if (!autoReply) throw new Error('Auto reply not found')

  post.autoReplies.set(autoReplyId, {
    ...autoReply,
    status: autoReply.status === 'active' ? 'inactive' : 'active',
  })
}

// ACTIVATE/DEACTIVATE ALL AUTO REPLIES
type ToggleAllAutoRepliesStatusArgs = {
  postId: Post['id']
  intent: 'activate' | 'deactivate'
}
function toggleAllAutoRepliesStatus({ postId, intent }: ToggleAllAutoRepliesStatusArgs) {
  const post = posts.value.get(postId)
  if (!post) throw new Error('Post not found')

  post.autoReplies.forEach((autoReply, key) => {
    post.autoReplies.set(key, {
      ...autoReply,
      status: intent === 'activate' ? 'active' : 'inactive',
    })
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
                          @click="viewPostModalRef?.modal.open({ id, ...post })"
                        >
                          <i class="bx bx-show text-xl"></i>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Auto Reply</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="viewPostCommentAutoRepliesModalRef?.modal.open({ id, ...post })"
                        >
                          <i class="bx bx-list-ul text-xl"></i>
                          View All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            createEditAutoReplyModalRef?.modal.open({
                              intent: 'create',
                              post,
                            })
                          "
                        >
                          <i class="bx bx-message-square-add text-xl"></i>
                          Create
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            toggleAllAutoRepliesStatus({
                              postId: id,
                              intent: 'activate',
                            })
                          "
                        >
                          <i class="bx bx-play-circle text-xl"></i>
                          Activate All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            toggleAllAutoRepliesStatus({
                              postId: id,
                              intent: 'deactivate',
                            })
                          "
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
              <TableRow v-for="[id, autoReply] in allAutoReplies" :key="id">
                <TableCell>{{ id }}</TableCell>
                <TableCell>{{ autoReply.name }}</TableCell>
                <TableCell class="whitespace-nowrap">
                  <div class="flex items-center gap-x-2">
                    <Avatar class="size-9">
                      <AvatarImage :src="autoReply.post.user.image" />
                    </Avatar>
                    <a
                      :href="`http://example.com/${autoReply.post.id}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-500 hover:underline"
                    >
                      Post ID: {{ autoReply.post.id }}
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
                            toggleAutoReplyStatus({ postId: autoReply.post.id, autoReplyId: id })
                          "
                        >
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
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Post</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="viewPostModalRef?.modal.open(autoReply.post)"
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
      @toggle-button-click="toggleAutoReplyStatus($event)"
    />
    <CreateEditAutoReplyModal ref="createEditAutoReplyModal" />
  </DefaultLayout>
</template>

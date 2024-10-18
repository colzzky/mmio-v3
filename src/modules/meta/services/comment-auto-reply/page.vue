<script setup lang="ts">
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
import type { Modal } from '@/core/utils/types'
import { uiHelpers } from '@/core/utils/ui-helper'
import { computed, reactive, ref } from 'vue'

// @temporary: can be extracted to another file
export type AutoReply = {
  id: number
  name: string
  status: 'active' | 'inactive'
  created: Date
  updated: Date
}

// @temporary: can be extracted to another file
export type FacebookPost = {
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

const allAutoReplies = computed(
  () =>
    new Map(
      Array.from(facebookPosts.value.entries()).flatMap(
        ([facebookPostId, { autoReplies, ...facebookPostRest }]) =>
          Array.from(autoReplies.entries()).map(([autoReplyId, autoReply]) => [
            autoReplyId,
            { ...autoReply, post: { ...facebookPostRest, id: facebookPostId } },
          ]),
      ),
    ),
)

// VIEW POST MODAL
interface ViewPostModalInterface extends Omit<Modal, 'open'> {
  post: Omit<FacebookPost, 'autoReplies'> | null
  open(post: Omit<FacebookPost, 'autoReplies'>): void
}
const viewPostModal = reactive<ViewPostModalInterface>({
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
interface ViewPostCommentAutoRepliesModalInterface extends Omit<Modal, 'open'> {
  post: FacebookPost | null
  open(post: FacebookPost): void
}
const viewPostCommentAutoRepliesModal = reactive<ViewPostCommentAutoRepliesModalInterface>({
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

// TOGGLE AUTO REPLY STATUS
function handleToggleAutoReplyStatus({
  facebookPostId = 0,
  autoReplyId,
}: {
  facebookPostId?: FacebookPost['id']
  autoReplyId: AutoReply['id']
}) {
  const facebookPost = facebookPosts.value.get(facebookPostId)
  if (!facebookPost) throw new Error('Facebook post not found')

  const autoReply = facebookPost.autoReplies.get(autoReplyId)
  if (!autoReply) throw new Error('Auto reply not found')

  facebookPost.autoReplies.set(autoReplyId, {
    ...autoReply,
    status: autoReply.status === 'active' ? 'inactive' : 'active',
  })
}

// ACTIVATE ALL AUTO REPLIES
function handleToggleAllAutoRepliesStatus({
  facebookPostId,
  intent,
}: {
  facebookPostId: FacebookPost['id']
  intent: 'activate' | 'deactivate'
}) {
  const facebookPost = facebookPosts.value.get(facebookPostId)
  if (!facebookPost) throw new Error('Facebook post not found')

  facebookPost.autoReplies.forEach((autoReply, key) => {
    facebookPost.autoReplies.set(key, {
      ...autoReply,
      status: intent === 'activate' ? 'active' : 'inactive',
    })
  })
}
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
                          @click="viewPostCommentAutoRepliesModal.open({ id, ...post })"
                        >
                          <i class="bx bx-list-ul text-xl"></i>
                          View All
                        </DropdownMenuItem>
                        <DropdownMenuItem class="gap-x-3" disabled>
                          <i class="bx bx-message-square-add text-xl"></i>
                          Create
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            handleToggleAllAutoRepliesStatus({
                              facebookPostId: id,
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
                            handleToggleAllAutoRepliesStatus({
                              facebookPostId: id,
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
                      Post ID: {{ id }}
                    </a>
                  </div>
                </TableCell>
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
                        <DropdownMenuLabel>Auto Reply</DropdownMenuLabel>
                        <DropdownMenuItem
                          class="gap-x-3"
                          @click="
                            handleToggleAutoReplyStatus({
                              facebookPostId: autoReply.post.id,
                              autoReplyId: id,
                            })
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
                          @click="viewPostModal.open(autoReply.post)"
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

    <!-- VIEW POST COMMENT AUTO REPLY MODAL -->
    <ViewPostCommentAutoRepliesModal
      v-model:open="viewPostCommentAutoRepliesModal.isOpen"
      :post="viewPostCommentAutoRepliesModal.post"
      @update:open="viewPostCommentAutoRepliesModal.close()"
      @toggle-dropdown-click="handleToggleAutoReplyStatus($event)"
    />

    <!-- VIEW POST MODAL -->
    <ViewPostModal
      v-model:open="viewPostModal.isOpen"
      @update:open="viewPostModal.close()"
      :post="viewPostModal.post"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { AspectRatio } from '@/core/components/ui/aspect-ratio'
import { Avatar, AvatarImage } from '@/core/components/ui/avatar'
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
  autoReplies: number
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
        autoReplies: 5,
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
        autoReplies: 5,
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
        autoReplies: 5,
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
                <TableCell>{{ post.autoReplies }}</TableCell>
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
                        <DropdownMenuItem class="gap-x-3">
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

    <Dialog v-model:open="viewPostModal.isOpen" @update:open="viewPostModal.close()">
      <DialogContent v-if="viewPostModal.post" class="max-w-md">
        <DialogHeader class="flex flex-col gap-y-2">
          <DialogTitle>View Post</DialogTitle>
          <DialogDescription
            class="grid grid-cols-[var(--avatar-size),1fr] items-center gap-x-2 text-xs [--avatar-size:theme(spacing.8)]"
          >
            <Avatar class="row-span-2 size-[var(--avatar-size)]">
              <AvatarImage :src="viewPostModal.post.user.image"></AvatarImage>
            </Avatar>
            <span>{{ viewPostModal.post.user.name }}</span>
            <a
              :href="`http://example.com/${viewPostModal.post.id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="self-start text-blue-500 hover:underline"
            >
              Post ID: {{ viewPostModal.post.id }}
            </a>
          </DialogDescription>
        </DialogHeader>
        <section class="flex flex-col gap-y-4 text-sm">
          <p class="text-pretty">{{ viewPostModal.post.description }}</p>
          <AspectRatio :ratio="16 / 9">
            <img :src="viewPostModal.post.image" class="h-full w-full rounded-md object-cover" />
          </AspectRatio>
          <div class="flex items-center gap-x-4 text-muted-foreground">
            <span>{{ viewPostModal.post.likes }} Likes</span>
            <span>{{ viewPostModal.post.comments }} Comment</span>
            <span>{{ viewPostModal.post.shares }} Shares</span>
            <span class="grow text-end">
              {{ viewPostModal.post.created.toLocaleDateString() }}
            </span>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  </DefaultLayout>
</template>

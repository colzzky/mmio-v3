<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/core/components/ui/avatar'
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
import { ref } from 'vue'

type FacebookPost = {
  id: number
  description: string
  created: Date
  autoReplies: number
}

const facebookPosts = ref(
  new Map<FacebookPost['id'], Omit<FacebookPost, 'id'>>([
    [
      1,
      {
        description:
          'Lorem ipsum odor amet, consectetuer adipiscing elit. Malesuada a libero fames ultricies parturient litora penatibus maecenas? Varius ligula tristique donec quis eget scelerisque eros erat. Sagittis placerat fusce platea adipiscing taciti phasellus nec porta. Rutrum etiam cubilia quis maximus maecenas. Finibus imperdiet viverra elit phasellus nec tempor eu tincidunt nibh. Ac feugiat felis placerat tempus quis dis elit eget. Vel dis ultricies lobortis amet dui. Fusce torquent ipsum justo nam aliquam faucibus varius fusce nullam.',
        created: new Date('April 22, 2024'),
        autoReplies: 5,
      },
    ],
    [
      2,
      {
        description:
          'Lacinia finibus penatibus ornare laoreet ipsum commodo netus. Taciti feugiat torquent auctor libero lectus. Vivamus eleifend arcu rhoncus, eleifend lobortis pulvinar. Gravida dis donec laoreet congue laoreet pharetra scelerisque fames lacus. Proin natoque duis hendrerit sollicitudin consectetur vel hendrerit fermentum. Sollicitudin phasellus magna elementum platea pretium nulla ultricies. Ut vehicula fusce ac vehicula velit. Quis id natoque velit vivamus eros efficitur platea. Pellentesque vehicula tempor gravida non pulvinar proin sem ex.',
        created: new Date('April 07, 2024'),
        autoReplies: 5,
      },
    ],
    [
      3,
      {
        description:
          'Potenti ornare mauris risus lobortis pharetra nullam ipsum. Vestibulum quam a aliquam ex magnis. Donec vel maecenas facilisi; proin accumsan torquent. Maximus dolor tincidunt, ut accumsan consectetur posuere egestas hac cubilia. Cras bibendum adipiscing vulputate rhoncus vel nascetur laoreet? Primis vel vel tempor vulputate; nibh sem nisl amet? Aliquet mus aptent magnis curabitur urna taciti nascetur. Libero sociosqu gravida penatibus est mollis interdum enim auctor donec. Tellus imperdiet conubia eleifend quam porta. Nunc curabitur ligula sagittis mauris mollis ac ligula ante eleifend.',
        created: new Date('August 24, 2024'),
        autoReplies: 5,
      },
    ],
  ]),
)
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
                      <AvatarImage :src="`https://picsum.photos/id/${id}/200/300`" />
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
                        <DropdownMenuItem class="gap-x-3">
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
  </DefaultLayout>
</template>

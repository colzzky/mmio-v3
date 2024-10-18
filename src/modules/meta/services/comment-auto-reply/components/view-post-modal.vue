<script setup lang="ts">
import type { FacebookPost } from '../page.vue'
import { AspectRatio } from '@/core/components/ui/aspect-ratio'
import { Avatar, AvatarImage } from '@/core/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog'

defineProps<{ post: Omit<FacebookPost, 'autoReplies'> | null }>()
</script>

<template>
  <Dialog>
    <DialogContent class="max-w-md">
      <DialogHeader class="flex flex-col gap-y-2">
        <DialogTitle>View Post</DialogTitle>
        <DialogDescription
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
        </DialogDescription>
      </DialogHeader>
      <section class="flex flex-col gap-y-4 text-sm">
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
      </section>
    </DialogContent>
  </Dialog>
</template>

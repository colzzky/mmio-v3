<script setup lang="ts">
import { chats } from './temporaries'
import { Avatar, AvatarFallback, AvatarImage } from '@/core/components/ui/avatar'
import { Button } from '@/core/components/ui/button'
import { Card } from '@/core/components/ui/card'
import { Input } from '@/core/components/ui/input'
import Main from '@/core/components/ui/main.vue'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const chatsMap = new Map(chats.map((chat) => [chat.id, chat]))

const route = useRoute()
const selectedChat = computed(() => chatsMap.get(+(route.query.chatId ?? chats[0].id)) ?? chats[0])
</script>

<template>
  <Main class="grid gap-y-4 [--container-padding:theme(spacing.4)]">
    <template #heading>Live Chat</template>
    <Card
      class="grid h-[calc(100svh-var(--header-height)-(var(--container-padding)*2))] grid-cols-[var(--inline-cols)_minmax(0,1fr)_var(--inline-cols)] grid-rows-1 overflow-hidden text-xs [--header-height:64px] [--inline-cols:min(250px)]"
    >
      <!-- chat list -->
      <section class="flex flex-col gap-y-4 border-e p-4">
        <div>
          <Input type="search" placeholder="Search chats..." />
        </div>
        <ScrollArea>
          <RouterLink
            v-for="[chatId, chat] in chatsMap"
            :key="chatId"
            :to="{ query: { chatId } }"
            :class="[
              'grid grid-cols-[40px_minmax(0,1fr)] gap-x-1 rounded-md p-2',
              selectedChat?.id === chatId ? 'bg-primary/10' : 'hover:bg-primary/5',
            ]"
          >
            <Avatar class="size-8">
              <AvatarImage :src="chat.image" />
              <AvatarFallback>{{ chat.name }}</AvatarFallback>
            </Avatar>
            <div>
              <strong>{{ chat.name }}</strong>
              <p class="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                {{ chat.messages[chat.messages.length - 1].content }}
              </p>
            </div>
          </RouterLink>
        </ScrollArea>
      </section>

      <!-- chat -->
      <section class="flex flex-col text-sm">
        <div class="flex items-center gap-x-3 border-b px-4 py-3">
          <Avatar class="size-8">
            <AvatarImage :src="selectedChat.image" />
            <AvatarFallback>{{ selectedChat.name }}</AvatarFallback>
          </Avatar>
          <div class="flex flex-col gap-y-1">
            <strong class="leading-none">{{ selectedChat.name }}</strong>
            <small class="leading-none text-muted-foreground">Active now</small>
          </div>
        </div>
        <ScrollArea class="h-full p-4 [&>div>div]:flex [&>div>div]:flex-col [&>div>div]:gap-y-4">
          <article
            v-for="message in selectedChat.messages"
            :key="message.id"
            :class="[
              'max-w-[75%] rounded-lg p-3 text-xs',
              message.sentBy === selectedChat.name
                ? 'self-start bg-primary/5'
                : 'self-end bg-primary text-primary-foreground',
            ]"
          >
            {{ message.content }}
          </article>
        </ScrollArea>
        <div class="flex items-center gap-x-2 border-t p-4">
          <Input placeholder="Type your message..." />
          <Button>
            <i class="bx bx-send" />
          </Button>
        </div>
      </section>

      <!-- chat info -->
      <section class="flex flex-col gap-y-8 border-s p-4 text-xs">
        <div class="flex flex-col items-center justify-center gap-y-2">
          <Avatar class="size-20">
            <AvatarImage :src="selectedChat.image" />
            <AvatarFallback>{{ selectedChat.name }}</AvatarFallback>
          </Avatar>
          <strong>{{ selectedChat.name }}</strong>
        </div>
        <div class="grid gap-y-1">
          <h2 class="text-sm font-bold">Contact Information</h2>
          <div>
            <div class="flex items-center gap-x-2">
              <i class="bx bxs-envelope text-sm" />
              {{ selectedChat.email }}
            </div>
            <div class="flex items-center gap-x-2">
              <i class="bx bxs-phone text-sm" />
              {{ selectedChat.phone }}
            </div>
          </div>
        </div>
      </section>
    </Card>
  </Main>
</template>

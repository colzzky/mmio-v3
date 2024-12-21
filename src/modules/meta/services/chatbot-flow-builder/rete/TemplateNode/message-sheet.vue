<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/core/components/ui/select'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/core/components/ui/sheet'
import { Textarea } from '@/core/components/ui/textarea'
import type { MeteTemplateOutput } from '@/core/utils/flow-types'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

defineProps<{
  replies: [string, MeteTemplateOutput | undefined][]
  quickReplies: [string, MeteTemplateOutput | undefined][]
}>()

type State = 'main' | 'create-reply-button' | 'create-quick-reply-button'
const sheetState = ref<State>('main')
function handleChangeSheetState(state: State) {
  sheetState.value = state
}
</script>

<template>
  <Sheet>
    <SheetTrigger>Edit</SheetTrigger>
    <SheetContent class="flex flex-col gap-y-6">
      <SheetHeader>
        <SheetTitle
          class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 items-center gap-x-4 text-sm [--icon-size:theme(spacing.6)]"
        >
          <Icon
            v-if="sheetState === 'main'"
            icon="bx:message"
            class="row-span-full size-[var(--icon-size)]"
          />
          <button
            v-else
            type="button"
            @click="handleChangeSheetState('main')"
            class="row-span-full"
          >
            <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
          </button>
          <span class="leading-none">Flow Name 1</span>
          <small class="leading-none text-muted-foreground">
            Message
            <template v-if="sheetState === 'create-reply-button'">
              > Create Message Reply Button
            </template>
            <template v-if="sheetState === 'create-quick-reply-button'">
              > Create Quick Reply Button
            </template>
          </small>
        </SheetTitle>
      </SheetHeader>
      <main v-if="sheetState === 'main'" class="grid gap-y-6 text-sm">
        <section class="grid gap-y-1.5">
          <Label for="nodeName">Node Name</Label>
          <Input
            id="nodeName"
            type="text"
            name="nodeName"
            placeholder="What do you call this node"
          />
        </section>
        <section class="grid gap-y-1.5">
          <Label for="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            rows="5"
            placeholder="Whats the message you want to sent to the user?"
          />
        </section>
        <section class="grid grid-cols-2 gap-y-3">
          <h3 class="font-medium">Message Reply Buttons</h3>
          <button
            type="button"
            class="justify-self-end font-medium text-red-400 hover:text-red-500"
            @click="handleChangeSheetState('create-reply-button')"
          >
            Create
          </button>
          <ul class="col-span-full grid gap-y-3">
            <template v-for="[key, reply] in replies" :key>
              <li
                v-if="reply"
                class="grid grid-cols-[1fr_var(--icon-size)] grid-rows-2 items-center [--icon-size:theme(spacing.9)] *:leading-none"
              >
                <p class="text-xs">{{ reply.data.question }}</p>
                <strong>{{ reply.data.answer }}</strong>
                <button
                  type="button"
                  class="col-start-2 row-span-full grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5"
                >
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </button>
              </li>
            </template>
          </ul>
        </section>
        <section class="grid grid-cols-2 gap-y-3">
          <h3 class="font-medium">Quick Replies Buttons</h3>
          <button
            type="button"
            class="justify-self-end font-medium text-blue-400 hover:text-blue-500"
            @click="handleChangeSheetState('create-quick-reply-button')"
          >
            Create
          </button>
          <ul class="col-span-full grid gap-y-3">
            <template v-for="[key, quickReply] in quickReplies" :key>
              <li
                v-if="quickReply"
                class="grid grid-cols-[1fr_var(--icon-size)] items-center [--icon-size:theme(spacing.9)] *:leading-none"
              >
                <p>{{ quickReply.data.label }}</p>
                <button
                  type="button"
                  class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5"
                >
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </button>
              </li>
            </template>
          </ul>
        </section>
      </main>
      <main v-else-if="sheetState === 'create-reply-button'" class="grid gap-y-6 text-sm">
        <section class="grid gap-y-1.5">
          <Label for="buttonName">Button Name</Label>
          <Input
            id="buttonName"
            type="text"
            name="buttonName"
            placeholder="What do you call this button"
          />
        </section>
        <section class="grid gap-y-1.5">
          <Label for="buttonName">Button Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a button type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="buttonTypeOne">Button Type #1</SelectItem>
                <SelectItem value="buttonTypeTwo">Button Type #2</SelectItem>
                <SelectItem value="buttonTypeThree">Button Type #3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </section>
        <Button>Create Message Reply Button</Button>
      </main>
      <main v-else-if="sheetState === 'create-quick-reply-button'" class="grid gap-y-6 text-sm">
        <section class="grid gap-y-1.5">
          <Label for="quickReplyName">Quick Reply Name</Label>
          <Input
            id="quickReplyName"
            type="text"
            name="quickReplyName"
            placeholder="What do you call this quick reply"
          />
        </section>

        <Button>Create Quick Reply Button</Button>
      </main>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/core/components/ui/dropdown-menu'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { Textarea } from '@/core/components/ui/textarea'
import type { Node } from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

defineProps<{ data: Node<'message_node'> }>()

type State = 'default' | 'create-button' | 'edit-button' | 'create-quick-reply' | 'edit-quick-reply'
const sheetState = ref<State>('default')
function handleChangeState(state: State) {
  sheetState.value = state
}
</script>

<template>
  <SheetContent side="left" class="p-0">
    <template v-if="sheetState === 'default'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <Icon icon="bx:carousel" class="row-span-full size-[var(--icon-size)] self-center" />
        <SheetTitle class="leading-none">{{ data.data?.name }}</SheetTitle>
        <SheetDescription class="leading-none"> Carousel </SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3">
        <div>
          <Label for="name">Node Name</Label>
          <Input id="name" type="text" name="name" placeholder="What do you call this node?" />
        </div>
        <div>
          <Label for="text">Text Message</Label>
          <Textarea id="text" name="text" rows="5" class="resize-none" placeholder="" />
        </div>
        <div class="grid gap-y-3 text-sm">
          <h3 class="font-medium">Card Buttons</h3>
          <ul class="text-xs">
            <li class="flex items-center justify-between">
              Free Consultation
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem class="gap-x-2" @click="handleChangeState('edit-button')">
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
          <Button
            type="button"
            variant="ghost"
            class="w-full border-2 border-dashed text-muted-foreground"
            @click="handleChangeState('create-button')"
          >
            Add Buttons
          </Button>
        </div>
        <div class="mt-2 grid gap-y-3 text-sm">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Quick Reply Buttons</h3>
            <button type="button" class="font-medium text-destructive">Clear</button>
          </div>
          <ul class="text-xs">
            <li class="flex items-center justify-between">
              Free Consultation
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem class="gap-x-2" @click="handleChangeState('edit-quick-reply')">
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
          <Button
            type="button"
            variant="ghost"
            class="w-full border-2 border-dashed text-muted-foreground"
            @click="handleChangeState('create-quick-reply')"
          >
            Add Quick Reply
          </Button>
        </div>
      </main>
    </template>
    <template v-else-if="sheetState === 'create-button' || sheetState === 'edit-button'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <button
          type="button"
          class="row-span-full self-center"
          @click="handleChangeState('default')"
        >
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <SheetTitle class="leading-none">{{ data.data?.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="handleChangeState('default')"
          >
            Carousel
          </button>
          > Buttons
        </SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3">
        <div>
          <Label for="label">Button Label</Label>
          <Input id="label" type="text" name="label" placeholder="What do you call this button?" />
        </div>
        <div>
          <Label for="type">Button Type</Label>
          <Select id="type" name="type">
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="web_url">Web URL</SelectItem>
                <SelectItem value="postback">Postback</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button v-if="sheetState === 'create-button'" type="button">Add Button</Button>
        <template v-else>
          <Button type="button">Update Button</Button>
          <Button type="button" variant="destructive">Remove Button</Button>
        </template>
      </main>
    </template>
    <template v-else-if="sheetState === 'create-quick-reply' || sheetState === 'edit-quick-reply'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <button
          type="button"
          class="row-span-full self-center"
          @click="handleChangeState('default')"
        >
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <SheetTitle class="leading-none">{{ data.data?.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="handleChangeState('default')"
          >
            Carousel
          </button>
          > Quick Reply
        </SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3">
        <div>
          <Label for="label">Quick Reply Label</Label>
          <Input
            id="label"
            type="text"
            name="label"
            placeholder="What do you call this quick reply?"
          />
        </div>
        <div>
          <Label for="type">Quick Reply Type</Label>
          <Select id="type" name="type">
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="user_email">User Email</SelectItem>
                <SelectItem value="user_phone_number">User Phone Number</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button v-if="sheetState === 'create-quick-reply'" type="button">Add Quick Reply</Button>
        <template v-else>
          <Button type="button">Update Quick Reply</Button>
          <Button type="button" variant="destructive">Remove Quick Reply</Button>
        </template>
      </main>
    </template>
  </SheetContent>
</template>

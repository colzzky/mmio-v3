<script setup lang="ts" generic="S extends BaseSchemes, K">
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
import { toast } from '@/core/components/ui/toast'
import { uiHelpers } from '@/core/utils/ui-helper'
import type { FBAttachmentTemplate } from '@/modules/meta/utils/flow-meta-types'
import {
  createMetaTemplateOutIn,
  ReteSockets,
  type Button as MetaButton,
  type Node,
  type QuickReply,
} from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import type { BaseSchemes } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { reactive, ref, watch } from 'vue'

const props = defineProps<{ data: Node<'message_node'>; area: AreaPlugin<S, K> }>()

const localData = ref<Node<'message_node'>>(uiHelpers.deepCopy(props.data))

const { active_flow } = storeToRefs(useAuthWorkspaceStore())
const { rete_init } = active_flow.value

// CHANGE SHEET STATE
type State =
  | 'default'
  | 'create-message-reply'
  | 'edit-message-reply'
  | 'create-quick-reply'
  | 'edit-quick-reply'
const sheetState = ref<State>('default')

interface Form<T extends 'message-reply' | 'quick-reply'> {
  form: T extends 'message-reply' ? FBAttachmentTemplate.Button : FBAttachmentTemplate.QuickReply
  initialState: () => void

  submitForm: (event: SubmitEvent) => void
  createButton: () => void
  updateButton: () => void
  deleteButton: (key: string) => void

  intent: T extends 'message-reply'
    ? Extract<State, 'default' | 'create-message-reply' | 'edit-message-reply'>
    : Extract<State, 'default' | 'create-quick-reply' | 'edit-quick-reply'>
  buttonKey: string | null
  changeIntent: T extends 'message-reply'
    ? (
        args:
          | { intent: Extract<State, 'default' | 'create-message-reply'> }
          | { intent: Extract<State, 'edit-message-reply'>; key: string; reply: MetaButton },
      ) => void
    : (
        args:
          | { intent: Extract<State, 'default' | 'create-quick-reply'> }
          | { intent: Extract<State, 'edit-quick-reply'>; key: string; quickReply: QuickReply },
      ) => void

  deleteAllButtons?: () => void
}

// MESSAGE REPLY BUTTON FORM
const messageReplyButtonForm = reactive<Form<'message-reply'>>({
  form: {
    title: 'Untitled Button',
    type: 'postback',
  },
  initialState() {
    this.form.title = 'Untitled Button'
    this.form.type = 'postback'

    this.intent = 'default'
    this.buttonKey = null
  },

  submitForm(event: SubmitEvent) {
    const action = event.submitter?.dataset.action
    switch (action) {
      case 'create':
        this.createButton()
        break
      case 'update':
        this.updateButton()
        break
      case 'delete':
        this.deleteButton(this.buttonKey ?? '')
        break

      default:
        throw new Error('UNHANDLED ACTION')
    }
  },
  createButton() {
    if (!localData.value.data) throw new Error('no localData.data')

    const newButton = createMetaTemplateOutIn({
      node: props.data,
      socket: ReteSockets['button'],
    })

    const postbackId = crypto.randomUUID()
    localData.value.data.giver_data[newButton.key] = postbackId
    localData.value.data.buttons[newButton.key] = { ...this.form }

    toast({
      title: 'Message Reply Button Added',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  updateButton() {
    if (!localData.value.data) throw new Error('no localData.data')
    if (!this.buttonKey) throw new Error('no buttonKey')

    localData.value.data.buttons[this.buttonKey] = { ...this.form }

    toast({
      title: 'Message Reply Button Edited',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  deleteButton(key: string) {
    if (!localData.value.data) throw new Error('no localData.data')
    if (!key) throw new Error('no key')

    delete localData.value.data.buttons[key]

    toast({
      title: 'Message Reply Button Deleted',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },

  intent: 'default',
  buttonKey: null,
  changeIntent(args) {
    this.intent = args.intent
    sheetState.value = args.intent

    this.initialState()

    if (args.intent === 'edit-message-reply') {
      this.buttonKey = args.key
      this.form = { ...args.reply }
    }
  },
})

// QUICK REPLY BUTTON FORM
const quickReplyButtonForm = reactive<Form<'quick-reply'>>({
  form: {
    title: 'Untitled Button',
    content_type: 'text',
  },
  initialState() {
    this.form.title = 'Untitled Button'
    this.form.content_type = 'text'

    this.intent = 'default'
    this.buttonKey = null
  },

  submitForm(event: SubmitEvent) {
    const action = event.submitter?.dataset.action
    switch (action) {
      case 'create':
        this.createButton()
        break
      case 'update':
        this.updateButton()
        break
      case 'delete':
        this.deleteButton(this.buttonKey ?? '')
        break

      default:
        throw new Error('UNHANDLED ACTION')
    }
  },
  createButton() {
    if (!localData.value.data) throw new Error('no localData.data')

    const newButton = createMetaTemplateOutIn({
      node: props.data,
      socket: ReteSockets['quickreply'],
    })

    const postbackId = crypto.randomUUID()
    localData.value.data.giver_data[newButton.key] = postbackId
    localData.value.data.quick_replies[newButton.key] = { ...this.form }

    toast({
      title: 'Quick Reply Button Added',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  updateButton() {
    if (!localData.value.data) throw new Error('no localData.data')
    if (!this.buttonKey) throw new Error('no buttonKey')

    localData.value.data.quick_replies[this.buttonKey] = { ...this.form }

    toast({
      title: 'Quick Reply Button Edited',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  deleteButton(key: string) {
    if (!localData.value.data) throw new Error('no localData.data')
    if (!key) throw new Error('no key')

    delete localData.value.data.quick_replies[key]

    toast({
      title: 'Quick Reply Button Deleted',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },

  intent: 'default',
  buttonKey: null,
  changeIntent(args) {
    this.intent = args.intent
    sheetState.value = args.intent

    this.initialState()

    if (args.intent === 'edit-quick-reply') {
      this.buttonKey = args.key
      this.form = { ...args.quickReply }
    }
  },

  deleteAllButtons() {
    if (!localData.value.data) throw new Error('no localData.data')

    localData.value.data.quick_replies = {}

    toast({
      title: 'All Quick Reply Buttons Cleared',
      variant: 'success',
      duration: 2000,
    })
  },
})

watch(
  () => localData.value,
  (value) => {
    const node = rete_init.editor?.getNode(value.id)
    if (!node) throw new Error('no node found')

    node.data = value.data
    props.area.update('node', node.id)
  },
  {
    deep: true,
  },
)
</script>

<template>
  <SheetContent v-if="localData.data" side="left" class="p-0">
    <!-- default state -->
    <template v-if="sheetState === 'default'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <Icon icon="bx:message" class="row-span-full size-[var(--icon-size)] self-center" />
        <SheetTitle class="leading-none">{{ localData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none"> Message </SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3">
        <div>
          <Label for="name">Node Name</Label>
          <Input
            v-model:model-value="localData.data.name"
            id="name"
            type="text"
            name="name"
            placeholder="What do you call this node?"
          />
        </div>
        <div>
          <Label for="text">Text Message</Label>
          <Textarea
            v-model:model-value="localData.data.text"
            id="text"
            name="text"
            rows="5"
            class="resize-none"
            placeholder=""
          />
        </div>
        <div class="grid gap-y-3 text-sm">
          <h3 class="font-medium">Message Reply Buttons</h3>
          <ul class="grid gap-y-1.5 text-xs">
            <li
              v-for="(reply, key) in localData.data.buttons"
              :key
              class="flex items-center justify-between"
            >
              {{ reply.title }}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    class="gap-x-2"
                    @click="
                      messageReplyButtonForm.changeIntent({
                        intent: 'edit-message-reply',
                        key,
                        reply,
                      })
                    "
                  >
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="gap-x-2"
                    @click="messageReplyButtonForm.deleteButton(key)"
                  >
                    <Icon icon="bx:trash" class="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
          <Button
            type="button"
            variant="ghost"
            class="w-full border-2 border-dashed text-muted-foreground"
            @click="messageReplyButtonForm.changeIntent({ intent: 'create-message-reply' })"
          >
            Add Buttons
          </Button>
        </div>
        <div class="mt-2 grid gap-y-3 text-sm">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Quick Reply Buttons</h3>
            <button
              type="button"
              class="font-medium text-destructive"
              @click="quickReplyButtonForm.deleteAllButtons"
            >
              Clear
            </button>
          </div>
          <ul class="grid gap-y-1.5 text-xs">
            <li
              v-for="(quickReply, key) in localData.data.quick_replies"
              :key
              class="flex items-center justify-between"
            >
              {{ quickReply.title }}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    class="gap-x-2"
                    @click="
                      quickReplyButtonForm.changeIntent({
                        intent: 'edit-quick-reply',
                        key,
                        quickReply,
                      })
                    "
                  >
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-2" @click="quickReplyButtonForm.deleteButton(key)">
                    <Icon icon="bx:trash" class="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
          <Button
            type="button"
            variant="ghost"
            class="w-full border-2 border-dashed text-muted-foreground"
            @click="quickReplyButtonForm.changeIntent({ intent: 'create-quick-reply' })"
          >
            Add Quick Reply
          </Button>
        </div>
      </main>
    </template>

    <!-- message reply button state -->
    <template
      v-else-if="sheetState === 'create-message-reply' || sheetState === 'edit-message-reply'"
    >
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <button
          type="button"
          class="row-span-full self-center"
          @click="messageReplyButtonForm.changeIntent({ intent: 'default' })"
        >
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <SheetTitle class="leading-none">{{ localData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="messageReplyButtonForm.changeIntent({ intent: 'default' })"
          >
            Message
          </button>
          > Buttons
        </SheetDescription>
      </SheetHeader>
      <!-- @note: have to **manually assert** since vue's typing for form submits are `Event` -->
      <!-- while the browser instance is typed as `SubmitEvent` -->
      <form
        class="grid gap-y-4 px-6 py-3"
        @submit.prevent="messageReplyButtonForm.submitForm($event as SubmitEvent)"
      >
        <div>
          <Label for="title">Button Title</Label>
          <Input
            v-model:model-value="messageReplyButtonForm.form.title"
            id="title"
            type="text"
            name="title"
            placeholder="What do you call this button?"
          />
        </div>
        <div>
          <Label for="type">Button Type</Label>
          <Select v-model:model-value="messageReplyButtonForm.form.type" id="type" name="type">
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="postback">Postback</SelectItem>
                <SelectItem value="web_url">Web URL</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button v-if="sheetState === 'create-message-reply'" type="submit" data-action="create">
          Add Button
        </Button>
        <template v-else>
          <Button type="submit" data-action="update">Update Button</Button>
          <Button type="submit" variant="destructive" data-action="delete">Remove Button</Button>
        </template>
      </form>
    </template>

    <!-- quick reply button state -->
    <template v-else-if="sheetState === 'create-quick-reply' || sheetState === 'edit-quick-reply'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <button
          type="button"
          class="row-span-full self-center"
          @click="quickReplyButtonForm.changeIntent({ intent: 'default' })"
        >
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <SheetTitle class="leading-none">{{ localData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="messageReplyButtonForm.changeIntent({ intent: 'default' })"
          >
            Message
          </button>
          > Quick Reply
        </SheetDescription>
      </SheetHeader>
      <!-- @note: have to **manually assert** since vue's typing for form submits are `Event` -->
      <!-- while the browser instance is typed as `SubmitEvent` -->
      <form
        class="grid gap-y-4 px-6 py-3"
        @submit.prevent="quickReplyButtonForm.submitForm($event as SubmitEvent)"
      >
        <div>
          <Label for="title">Quick Reply Title</Label>
          <Input
            v-model:model-value="quickReplyButtonForm.form.title"
            id="title"
            type="text"
            name="title"
            placeholder="What do you call this quick reply?"
          />
        </div>
        <div>
          <Label for="type">Quick Reply Type</Label>
          <Select
            v-model:model-value="quickReplyButtonForm.form.content_type"
            id="type"
            name="type"
          >
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
        <Button v-if="sheetState === 'create-quick-reply'" type="submit" data-action="create">
          Add Quick Reply
        </Button>
        <template v-else>
          <Button type="submit" data-action="update">Update Quick Reply</Button>
          <Button type="submit" variant="destructive" data-action="delete">
            Remove Quick Reply
          </Button>
        </template>
      </form>
    </template>
  </SheetContent>
</template>

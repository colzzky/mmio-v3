<script setup lang="ts">
import { nodeIconMapping, type MessageReplyForm, type QuickReplyForm } from '../utils'
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
import { SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { toast } from '@/core/components/ui/toast'
import { createMetaTemplateOutIn, Node, ReteSockets } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref, watch } from 'vue'

const { active_flow } = storeToRefs(useAuthWorkspaceStore())
const { rete_init } = active_flow.value

const localNodeData = ref<Node<'media_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(rete_init.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'media_node'>
})

watch(
  () => rete_init.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'media_node'>
    }
  },
)

// CHANGE SHEET STATE
type State =
  | 'default'
  | 'create-message-reply'
  | 'edit-message-reply'
  | 'create-quick-reply'
  | 'edit-quick-reply'
const sheetState = ref<State>('default')
function handleChangeState(state: State) {
  sheetState.value = state

  messageReplyButtonForm.initialState()
  quickReplyButtonForm.initialState()
}

// MESSAGE REPLY BUTTON FORM
const messageReplyButtonForm = reactive<MessageReplyForm>({
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
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    const newButton = createMetaTemplateOutIn({
      node: localNodeData.value,
      socket: ReteSockets['button'],
    })

    const postbackId = crypto.randomUUID()
    localNodeData.value.data.giver_data[newButton.key] = postbackId
    localNodeData.value.data.buttons[newButton.key] = { ...this.form }

    toast({
      title: 'Message Reply Button Created',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  updateButton() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!this.buttonKey) throw new Error('no buttonKey')

    localNodeData.value.data.buttons[this.buttonKey] = { ...this.form }

    toast({
      title: 'Message Reply Button Edited',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  deleteButton(key: string) {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!key) throw new Error('no key')

    delete localNodeData.value.data.buttons[key]

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
    handleChangeState(args.intent)

    if (args.intent === 'edit-message-reply') {
      this.buttonKey = args.key
      this.form = { ...args.reply }
    }
  },
})

// QUICK REPLY BUTTON FORM
const quickReplyButtonForm = reactive<QuickReplyForm>({
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
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    const newButton = createMetaTemplateOutIn({
      node: localNodeData.value,
      socket: ReteSockets['quickreply'],
    })

    const postbackId = crypto.randomUUID()
    localNodeData.value.data.giver_data[newButton.key] = postbackId
    localNodeData.value.data.quick_replies[newButton.key] = { ...this.form }

    toast({
      title: 'Quick Reply Button Created',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  updateButton() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!this.buttonKey) throw new Error('no buttonKey')

    localNodeData.value.data.quick_replies[this.buttonKey] = { ...this.form }

    toast({
      title: 'Quick Reply Button Edited',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  deleteButton(key: string) {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!key) throw new Error('no key')

    delete localNodeData.value.data.quick_replies[key]

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
    handleChangeState(args.intent)

    if (args.intent === 'edit-quick-reply') {
      this.buttonKey = args.key
      this.form = { ...args.quickReply }
    }
  },

  deleteAllButtons() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    localNodeData.value.data.quick_replies = {}

    toast({
      title: 'All Quick Reply Buttons Cleared',
      variant: 'success',
      duration: 2000,
    })
  },
})

function handleRemoveDelay() {
  if (!localNodeData.value?.data) return

  localNodeData.value.data.delay = '0'

  toast({
    title: 'Removed delay',
    variant: 'success',
    duration: 2000,
  })
}
</script>

<template>
  <template v-if="localNodeData && localNodeData.data">
    <!-- default state -->
    <template v-if="sheetState === 'default'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 gap-x-3 gap-y-1.5 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <Icon
          :icon="nodeIconMapping[localNodeData.label]"
          class="row-span-full size-[var(--icon-size)] self-center"
        />
        <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">Image</SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3">
        <div>
          <Label for="name">Name</Label>
          <Input
            v-model:model-value="localNodeData.data.name"
            id="name"
            type="text"
            name="name"
            placeholder="What do you call this node?"
          />
        </div>
        <div class="text-sm">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Delay</h3>
            <button type="button" class="font-medium text-destructive" @click="handleRemoveDelay">
              Remove Delay
            </button>
          </div>
          <div class="flex items-center gap-x-4">
            <Input
              v-model:model-value="localNodeData.data.delay"
              id="delay"
              type="range"
              name="delay"
              min="0"
              max="10"
              default-value="0"
            />
            <span class="whitespace-nowrap">
              {{ localNodeData.data.delay ?? '0' }}
              seconds
            </span>
          </div>
        </div>
        <div>
          <Label for="image">Image</Label>
          <div class="relative aspect-video rounded border-2 border-dashed p-1">
            <!-- <img alt="" class="size-full rounded object-cover object-center" /> -->
            <small
              class="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-balance text-center text-muted-foreground"
            >
              Drag and drop image here
            </small>
          </div>
        </div>
        <div class="grid gap-y-3 text-sm">
          <h3 class="font-medium">Message Reply Buttons</h3>
          <ul class="grid gap-y-1.5 text-xs">
            <li
              v-for="(reply, key) in localNodeData.data.buttons"
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
              v-for="(quickReply, key) in localNodeData.data.quick_replies"
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
    <!-- @note: have to **manually assert** since vue's typing for form submits are `Event`
      while the browser instance is typed as `SubmitEvent` -->
    <template
      v-else-if="sheetState === 'create-message-reply' || sheetState === 'edit-message-reply'"
    >
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
        <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="handleChangeState('default')"
          >
            Image
          </button>
          > Buttons
        </SheetDescription>
      </SheetHeader>

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
    <!-- @note: have to **manually assert** since vue's typing for form submits are `Event`
      while the browser instance is typed as `SubmitEvent` -->
    <template v-else>
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
        <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="handleChangeState('default')"
          >
            Image
          </button>
          > Quick Replies
        </SheetDescription>
      </SheetHeader>
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
  </template>
</template>

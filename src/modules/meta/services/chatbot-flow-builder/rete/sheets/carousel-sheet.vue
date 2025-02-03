<script setup lang="ts">
import { nodeIconMapping, type CarouselCardForm, type QuickReplyForm } from '../utils'
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
import { Separator } from '@/core/components/ui/separator'
import { SheetHeader, SheetTitle, SheetDescription } from '@/core/components/ui/sheet'
import { Textarea } from '@/core/components/ui/textarea'
import { toast } from '@/core/components/ui/toast'
import { createMetaTemplateOutIn, Node, ReteSockets } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import { onMounted, reactive, ref, watch } from 'vue'

const authWorkspace = useAuthWorkspaceStore()
const { active_flow, rete_init } = authWorkspace

const localNodeData = ref<Node<'carousel_node'> | undefined>(undefined)

onMounted(() => {
  const node = rete_init.editor?.getNode(active_flow.selected_node_id)
  if (!node) throw new Error('No Node found with the given ID')

  localNodeData.value = node as Node<'carousel_node'>
})

watch(
  () => active_flow.selected_node_id,
  (node_id) => {
    if (node_id) {
      const node = rete_init.editor?.getNode(node_id)
      if (!node) throw new Error('No Node found with the given ID')

      localNodeData.value = node as Node<'carousel_node'>
    }
  },
)

// CHANGE SHEET STATE
type State =
  | 'default'
  | 'create-quick-reply'
  | 'edit-quick-reply'
  | 'create-carousel-card'
  | 'edit-carousel-card'
  | 'create-carousel-card-button'
  | 'edit-carousel-card-button'
const sheetState = ref<State>('default')
function handleChangeState(state: State) {
  sheetState.value = state

  quickReplyButtonForm.initialState()

  if (state === 'default' || state === 'create-quick-reply' || state === 'edit-quick-reply') {
    carouselCardForm.initialState()
  }
}

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

const carouselCardForm = reactive<CarouselCardForm>({
  form: {
    image: '',
    image_aspect_ratio: '',
    title: '',
    text: '',
    buttons: {},
  },
  buttonForm: {
    title: 'Untitled Node',
    type: 'postback',
  },
  formInitialState() {
    this.form.image = ''
    this.form.image_aspect_ratio = ''
    this.form.title = ''
    this.form.text = ''
    this.form.buttons = {}
  },
  buttonFormInitialState() {
    this.buttonForm.title = 'Untitled Node'
    this.buttonForm.type = 'postback'
  },
  initialState() {
    this.formInitialState()
    this.buttonFormInitialState()

    this.intent = 'default'
    this.cardKey = null
    this.buttonKey = null
  },

  submitForm(event) {
    const action = event.submitter?.dataset.action
    switch (action) {
      case 'create-button':
        this.createButton()
        break

      case 'update-button':
        this.updateButton()
        break

      case 'delete-button':
        this.deleteButton(this.buttonKey ?? '')
        break

      case 'create-card':
        this.createCard()
        break

      case 'update-card':
        this.updateCard()
        break

      case 'delete-card':
        if (this.cardKey === null) return
        this.deleteCard(this.cardKey)
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
    this.form.buttons[newButton.key] = { ...this.buttonForm }

    toast({
      title: 'Carousel Card Button Created',
      variant: 'success',
      duration: 2000,
    })

    this.buttonFormInitialState()

    if (this.cardKey === null) {
      this.changeIntent({ intent: 'create-carousel-card' })
    } else {
      this.changeIntent({
        intent: 'edit-carousel-card',
        key: this.cardKey,
      })
    }
  },
  updateButton() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!this.buttonKey) throw new Error('no buttonKey')

    this.form.buttons[this.buttonKey] = { ...this.buttonForm }

    toast({
      title: 'Carousel Card Button Edited',
      variant: 'success',
      duration: 2000,
    })

    this.buttonFormInitialState()
    if (this.cardKey === null) {
      this.changeIntent({ intent: 'create-carousel-card' })
    } else {
      this.changeIntent({
        intent: 'edit-carousel-card',
        key: this.cardKey,
      })
    }
  },
  deleteButton(key) {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    delete this.form.buttons[key]

    toast({
      title: 'Carosel Card Button Deleted',
      variant: 'success',
      duration: 2000,
    })

    if (this.cardKey === null) {
      this.changeIntent({ intent: 'create-carousel-card' })
    } else {
      this.changeIntent({
        intent: 'edit-carousel-card',
        key: this.cardKey,
      })
    }
  },

  createCard() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    const card = createMetaTemplateOutIn({
      node: localNodeData.value,
      socket: ReteSockets['carouselItem'],
    })

    const postbackId = crypto.randomUUID()
    localNodeData.value.data.giver_data[card.key] = postbackId
    localNodeData.value.data.cards.push({ ...this.form })

    toast({
      title: 'Carousel Card Created',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  updateCard() {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')
    if (!this.cardKey) throw new Error('no cardKey')

    localNodeData.value.data.cards[this.cardKey] = { ...this.form }

    toast({
      title: 'Carousel Card Updated',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },
  deleteCard(key) {
    if (!localNodeData.value) throw new Error('no localData')
    if (!localNodeData.value.data) throw new Error('no localData.data')

    localNodeData.value.data.cards = [...localNodeData.value.data.cards].filter(
      (_, index) => key !== index,
    )

    toast({
      title: 'Carousel Card Deleted',
      variant: 'success',
      duration: 2000,
    })

    this.changeIntent({ intent: 'default' })
  },

  intent: 'default',
  cardKey: null,
  buttonKey: null,
  changeIntent(args) {
    this.intent = args.intent
    handleChangeState(args.intent)

    if (args.intent === 'create-carousel-card-button') {
      this.buttonKey = crypto.randomUUID()
    } else if (args.intent === 'edit-carousel-card-button') {
      this.buttonKey = args.key
      this.buttonForm = { ...args.button }
    } else if (args.intent === 'edit-carousel-card') {
      this.cardKey = args.key

      if (args.card) {
        this.form = { ...args.card }
      }
    }
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
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <Icon
          :icon="nodeIconMapping[localNodeData.label]"
          class="row-span-full size-[var(--icon-size)] self-center"
        />
        <SheetTitle class="leading-none">{{ localNodeData.data.name }}</SheetTitle>
        <SheetDescription class="leading-none">Carousel</SheetDescription>
      </SheetHeader>
      <main class="grid gap-y-4 px-6 py-3">
        <div>
          <Label for="name">Name</Label>
          <Input v-model:model-value="localNodeData.data.name" id="name" type="text" name="name" />
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
        <div class="grid gap-y-3 text-sm">
          <h3 class="font-medium">Carousel Cards</h3>
          <ul class="grid gap-y-1.5">
            <li
              v-for="(card, key) in localNodeData.data.cards"
              :key
              class="grid grid-cols-[var(--icon-size),1fr,max-content] gap-x-4 [--icon-size:theme(spacing.10)]"
            >
              <img
                :src="card.image"
                alt=""
                class="size-[var(--icon-size)] rounded-full object-cover object-center"
              />
              <div class="grid">
                <h4>{{ card.title }}</h4>
                <p class="self-end font-bold">{{ card.text }}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    class="gap-x-2"
                    @click="
                      carouselCardForm.changeIntent({ intent: 'edit-carousel-card', key, card })
                    "
                  >
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-2" @click="carouselCardForm.deleteCard(key)">
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
            @click="carouselCardForm.changeIntent({ intent: 'create-carousel-card' })"
          >
            Add Card
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

    <!-- carousel cards state -->
    <template
      v-else-if="sheetState === 'create-carousel-card' || sheetState === 'edit-carousel-card'"
    >
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
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
            Carousel
          </button>
          > Cards
        </SheetDescription>
      </SheetHeader>

      <!-- @note: have to **manually assert** since vue's typing for form submits are `Event`
      while the browser instance is typed as `SubmitEvent` -->
      <form
        class="grid gap-y-4 px-6 py-3"
        @submit.prevent="carouselCardForm.submitForm($event as SubmitEvent)"
      >
        <div class="grid gap-y-4">
          <div>
            <Label for="image-url">Image URL</Label>
            <Input
              v-model:model-value="carouselCardForm.form.image"
              id="image-url"
              type="text"
              name="image-url"
            />
          </div>
          <Separator label="OR" />
          <div class="relative aspect-video rounded border-2 border-dashed p-1">
            <img
              :src="carouselCardForm.form.image"
              alt=""
              class="size-full rounded object-cover object-center"
            />
            <small
              class="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-balance text-center text-muted-foreground"
            >
              Drag and drop media here
            </small>
          </div>
        </div>
        <div>
          <Label for="title">Title</Label>
          <Input
            v-model:model-value="carouselCardForm.form.title"
            id="title"
            type="text"
            name="title"
          />
        </div>
        <div>
          <Label for="text">Text Message</Label>
          <Textarea
            v-model:model-value="carouselCardForm.form.text"
            id="text"
            name="text"
            rows="5"
            class="resize-none"
            placeholder=""
          />
        </div>
        <div>
          <Label for="image-redirect-url">Image Redirect URL</Label>
          <Input id="image-redirect-url" type="text" name="image-redirect-url" />
        </div>
        <div class="grid gap-y-3 text-sm">
          <h3 class="font-medium">Buttons</h3>
          <ul class="grid gap-y-1.5 text-xs">
            <li
              v-for="(button, key) in carouselCardForm.form.buttons"
              :key
              class="flex items-center justify-between"
            >
              {{ button.title }}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span class="sr-only">open dropdown menu</span>
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    class="gap-x-2"
                    @click="
                      carouselCardForm.changeIntent({
                        intent: 'edit-carousel-card-button',
                        key,
                        button,
                      })
                    "
                  >
                    <Icon icon="bx:pencil" class="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-x-2" @click="carouselCardForm.deleteButton(key)">
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
            @click="carouselCardForm.changeIntent({ intent: 'create-carousel-card-button' })"
          >
            Add Buttons
          </Button>
        </div>
        <Button
          v-if="sheetState === 'create-carousel-card'"
          type="submit"
          data-action="create-card"
        >
          Add Card
        </Button>
        <template v-else>
          <Button type="submit" data-action="update-card">Update Card</Button>
          <Button type="submit" variant="destructive" data-action="delete-card">Remove Card</Button>
        </template>
      </form>
    </template>

    <!-- carousel cards button state -->
    <template
      v-else-if="
        carouselCardForm.buttonKey &&
        (sheetState === 'create-carousel-card-button' || sheetState === 'edit-carousel-card-button')
      "
    >
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
      >
        <button
          type="button"
          class="row-span-full self-center"
          @click="
            handleChangeState(
              carouselCardForm.cardKey !== null ? 'edit-carousel-card' : 'create-carousel-card',
            )
          "
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
            Carousel
          </button>
          >
          <button
            type="button"
            class="font-medium text-blue-600"
            @click="
              handleChangeState(
                carouselCardForm.cardKey !== null ? 'edit-carousel-card' : 'create-carousel-card',
              )
            "
          >
            Cards
          </button>
          > Buttons
        </SheetDescription>
      </SheetHeader>

      <!-- @note: have to **manually assert** since vue's typing for form submits are `Event`
      while the browser instance is typed as `SubmitEvent` -->
      <form
        class="grid gap-y-4 px-6 py-3"
        @submit.prevent="carouselCardForm.submitForm($event as SubmitEvent)"
      >
        <div>
          <Label for="title">Button Title</Label>
          <Input
            v-model:model-value="carouselCardForm.buttonForm.title"
            id="title"
            type="text"
            name="title"
            placeholder="What do you call this button?"
          />
        </div>
        <div>
          <Label for="type">Button Type</Label>
          <Select v-model:model-value="carouselCardForm.buttonForm.type" id="type" name="type">
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
        <Button
          v-if="sheetState === 'create-carousel-card-button'"
          type="submit"
          data-action="create-button"
        >
          Add Button
        </Button>
        <template v-else>
          <Button type="submit" data-action="update-button">Update Button</Button>
          <Button type="submit" variant="destructive" data-action="delete-button">
            Remove Button
          </Button>
        </template>
      </form>
    </template>

    <!-- quick reply button state -->
    <!-- @note: have to **manually assert** since vue's typing for form submits are `Event`
      while the browser instance is typed as `SubmitEvent` -->
    <template v-else-if="sheetState === 'create-quick-reply' || sheetState === 'edit-quick-reply'">
      <SheetHeader
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-[repeat(2,max-content)] gap-3 border-b-2 px-6 pb-3 pt-4 [--icon-size:theme(spacing.6)]"
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
            Carousel
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

<script setup lang="ts" generic="T extends Node<keyof NodeType>">
import { Button } from '@/core/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import DropdownMenuItem from '@/core/components/ui/dropdown-menu/DropdownMenuItem.vue'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { toast } from '@/core/components/ui/toast'
import type { FBAttachmentTemplate } from '@/core/utils/flow-meta-types'
import {
  createMetaTemplateOutput,
  MetaTemplateOutput,
  type AreaExtra,
  type Node,
  type NodeType,
  type Schemes,
} from '@/core/utils/flow-types'
import { Icon } from '@iconify/vue'
import { ClassicPreset } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps<{
  node: T
  node_id: string
  area: AreaPlugin<Schemes, AreaExtra>
}>()

const cards = ref<MetaTemplateOutput<'carouselCard'>[]>([])
const quickReplies = ref<MetaTemplateOutput<'quickReply'>[]>([])
const node_obj = ref<T | null>(null)

type State = 'main' | 'create-card-button' | 'create-quick-reply-button'
const sheetState = ref<State>('main')
function handleChangeSheetState(state: State) {
  sheetState.value = state
}

function resetState() {
  cards.value = []
  quickReplies.value = []
  node_obj.value = null
}

function initialize() {
  resetState()
  node_obj.value = props.node
  if (node_obj.value.data) {
    node_obj.value.data.name = node_obj.value.data.name || 'Untitled Node'
  }
  Object.keys(props.node.outputs).forEach((key) => {
    if (props.node.outputs[key] instanceof MetaTemplateOutput) {
      if (props.node.outputs[key].type === 'carouselCard') {
        cards.value.push(props.node.outputs[key])
      }
      if (props.node.outputs[key].type === 'quickReply') {
        quickReplies.value.push(props.node.outputs[key])
      }
    }
  })
}

const quick_reply_button = reactive({
  title: 'Untitled Reply',
  content_type: 'text' as FBAttachmentTemplate.QuickReply['content_type'],
  add_new_reply() {
    const socket = new ClassicPreset.Socket('socket')
    if (node_obj.value) {
      createMetaTemplateOutput({
        node: node_obj.value,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: this.title,
            content_type: this.content_type,
          },
        },
      })
      initialize()
      console.log(props.node_id)
      props.area.update('node', props.node.id)
      // console.log(props.area)
      toast({
        title: 'New Node Added',
        variant: 'success',
        duration: 1000,
      })
    }
  },
})

watch(
  () => props.node_id,
  async (init_new, init_old) => {
    if (init_new !== init_old) {
      initialize()
    }
  },
)

onMounted(() => {
  initialize()
})
onUnmounted(() => {
  resetState()
})
</script>

<template>
  <div class="space-y-5">
    <div>
      <div
        class="grid grid-cols-[var(--icon-size),1fr] grid-rows-2 items-center gap-x-4 text-sm [--icon-size:theme(spacing.6)]"
      >
        <Icon
          v-if="sheetState === 'main'"
          icon="bx:carousel"
          class="row-span-full size-[var(--icon-size)]"
        />
        <button v-else type="button" @click="handleChangeSheetState('main')" class="row-span-full">
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <span class="leading-none">Flow Name 1</span>
        <small class="leading-none text-muted-foreground">
          Carousel
          <template v-if="sheetState === 'create-card-button'"> > Create Card Button </template>
          <template v-if="sheetState === 'create-quick-reply-button'">
            > Create Quick Reply Button
          </template>
        </small>
      </div>
    </div>
    <main v-if="sheetState === 'main' && node_obj && node_obj.data" class="grid gap-y-6 text-sm">
      <section class="grid gap-y-1.5">
        <Label for="nodeName">Node Name</Label>
        <Input
          v-model="node_obj.data.name"
          d="nodeName"
          type="text"
          name="nodeName"
          placeholder="What do you call this node"
        />
      </section>
      <section class="grid grid-cols-2 gap-y-3">
        <h3 class="font-medium">Card Buttons</h3>
        <button
          type="button"
          class="justify-self-end font-medium text-red-400 hover:text-red-500"
          @click="handleChangeSheetState('create-card-button')"
        >
          New Card
        </button>
        <ul class="col-span-full grid gap-y-3">
          <template v-for="(card, key) in node.data?.cards" :key>
            <li
              v-if="card"
              class="grid grid-cols-[var(--icon-size)_1fr_var(--icon-size)] items-center gap-x-2 [--icon-size:theme(spacing.9)] *:leading-none"
            >
              <img :src="card.image" alt="" class="rounded-full" />
              <strong>{{ card.title }}</strong>
              <DropdownMenu>
                <DropdownMenuTrigger
                  class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5"
                >
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Card Dropdown Item #1</DropdownMenuItem>
                  <DropdownMenuItem>Card Dropdown Item #2</DropdownMenuItem>
                  <DropdownMenuItem>Card Dropdown Item #3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <template v-for="(quickReply, key) in quickReplies" :key>
            <li
              v-if="quickReply && quickReply.type === 'quickReply'"
              class="grid grid-cols-[1fr_var(--icon-size)] items-center [--icon-size:theme(spacing.9)] *:leading-none"
            >
              <p>{{ quickReply.data.title }}</p>
              <DropdownMenu>
                <DropdownMenuTrigger
                  class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5"
                >
                  <Icon icon="bx:dots-vertical-rounded" class="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Quick Reply Dropdown Item #1</DropdownMenuItem>
                  <DropdownMenuItem>Quick Reply Dropdown Item #2</DropdownMenuItem>
                  <DropdownMenuItem>Quick Reply Dropdown Item #3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </template>
        </ul>
      </section>
    </main>
    <main v-else-if="sheetState === 'create-card-button'" class="grid gap-y-6 text-sm">
      <section class="grid gap-y-1.5">
        <Label for="cardName">Card Name</Label>
        <Input id="cardName" type="text" name="cardName" placeholder="What do you call this card" />
      </section>
      <section class="grid gap-y-1.5">
        <Label for="cardDescription">Card Description</Label>
        <Textarea
          name="cardDescription"
          id="cardDescription"
          rows="5"
          placeholder="What's the message you want to send to the user?"
        />
      </section>

      <section
        class="grid aspect-video place-content-center border-2 border-dashed p-4 font-medium"
      >
        Drag and Drop Image Here
      </section>
      <section>/** section dedicated to adding output per cards */</section>
      <Button>Create Card Button</Button>
    </main>
    <main v-else-if="sheetState === 'create-quick-reply-button'" class="grid gap-y-6 text-sm">
      <section class="grid gap-y-1.5">
        <Label for="quickReplyName">Quick Reply Name</Label>
        <Input
          v-model="quick_reply_button.title"
          id="quickReplyName"
          type="text"
          name="quickReplyName"
          placeholder="What do you call this quick reply"
        />
      </section>

      <Button @click="quick_reply_button.add_new_reply()">Create Quick Reply Button</Button>
    </main>
  </div>
</template>

<script setup lang="ts" generic="T extends Node<keyof NodeType>">
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
import { Textarea } from '@/core/components/ui/textarea'
import { toast } from '@/core/components/ui/toast'
import type { FBAttachmentTemplate } from '@/modules/meta/utils/flow-meta-types'
import {
  createMetaTemplateOutIn,
  MetaTemplateOutput,
  ReteSockets,
  type AreaExtra,
  type Node,
  type NodeType,
  type Schemes,
} from '@/modules/meta/utils/flow-types'
import { Icon } from '@iconify/vue'
import type { AreaPlugin } from 'rete-area-plugin'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps<{
  node: T
  node_id: string
  area: AreaPlugin<Schemes, AreaExtra>
}>()

const replies = ref<MetaTemplateOutput[]>([])
const quickReplies = ref<MetaTemplateOutput[]>([])
const node_obj = ref<Node<'generic_node'> | null>(null)

type State = 'main' | 'create-reply-button' | 'create-quick-reply-button'
const sheetState = ref<State>('main')
function handleChangeSheetState(state: State) {
  sheetState.value = state
}

function resetState() {
  replies.value = []
  quickReplies.value = []
  node_obj.value = null
}

function initialize() {
  resetState()
  console.log('test')
  console.log(props.node)
  node_obj.value = props.node as Node<'generic_node'>
  if (node_obj.value.data) {
    node_obj.value.data.name = node_obj.value.data.name || 'Untitled Node'
    node_obj.value.data.text = node_obj.value.data.text || ''
  }
}

const reply_button = reactive({
  data: {
    type: 'postback',
    title: 'Untitled Button',
    payload: '',
  } as FBAttachmentTemplate.Button,
  add_new_reply() {
    if (node_obj.value && node_obj.value.data) {
      const reply_origin = createMetaTemplateOutIn({
        node: node_obj.value,
        socket: ReteSockets['carouselItem'],
      })
      const postback_id = `${crypto.randomUUID()}` // Origin Id where it will be referenced
      node_obj.value.data.giver_data[reply_origin.key] = postback_id
      node_obj.value.data.buttons[reply_origin.key] = { ...this.data }
      initialize()
      props.area.update('node', props.node.id)
      // console.log(props.area)
      toast({
        title: 'New Reply Button Added',
        variant: 'success',
        duration: 1000,
      })
    }
  },
})

const quick_reply_button = reactive({
  title: 'Untitled Reply',
  content_type: 'text' as FBAttachmentTemplate.QuickReply['content_type'],
  add_new_reply() {
    if (node_obj.value && node_obj.value.data) {
      const quickreply_origin = createMetaTemplateOutIn({
        node: node_obj.value,
        socket: ReteSockets['quickreply'],
      })
      const postback_id = `${crypto.randomUUID()}` // Origin Id where it will be referenced
      node_obj.value.data.giver_data[quickreply_origin.key] = postback_id
      node_obj.value.data.quick_replies[quickreply_origin.key] = {
        title: this.title,
        content_type: this.content_type,
        payload: postback_id,
      }
      initialize()
      props.area.update('node', props.node.id)
      // console.log(props.area)
      toast({
        title: 'New Reply Button Added',
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
          icon="bx:message"
          class="row-span-full size-[var(--icon-size)]"
        />
        <button v-else type="button" @click="handleChangeSheetState('main')" class="row-span-full">
          <Icon icon="bxs:left-arrow" class="size-[var(--icon-size)]" />
        </button>
        <span class="leading-none">{{
          node_obj?.data?.name ? node_obj?.data?.name : 'Untitled Generic Node'
        }}</span>
        <small class="leading-none text-muted-foreground">
          Generic Node
          <template v-if="sheetState === 'create-reply-button'">
            > Create Message Reply Button
          </template>
          <template v-if="sheetState === 'create-quick-reply-button'">
            > Create Quick Reply Button
          </template>
        </small>
      </div>
    </div>
    <main v-if="sheetState === 'main' && node_obj && node_obj.data" class="grid gap-y-6 text-sm">
      <section class="grid gap-y-1.5">
        <Label for="nodeName">Node Name</Label>
        <Input v-model="node_obj.data.name" type="text" placeholder="What do you call this node" />
      </section>

      <section class="grid gap-y-1.5">
        <Label for="nodeName">Image Url</Label>
        <Input v-model="node_obj.data.image" type="text" placeholder="Enter Image URL" />
      </section>

      <div
        class="flex min-h-28 items-center justify-center rounded-lg border-4 border-dotted border-gray-400 p-2"
      >
        <img
          v-if="node_obj.data.image"
          :src="node_obj.data.image"
          alt="Placeholder Image"
          class="max-h-full max-w-full rounded-lg object-contain"
        />
        <span v-else>Please put image URL</span>
      </div>

      <section class="grid gap-y-1.5">
        <Label for="title">Title:</Label>
        <Input
          v-model="node_obj.data.title"
          type="text"
          id="title"
          name="title"
          rows="5"
          placeholder="Whats the heading for this message?"
        />
      </section>

      <section class="grid gap-y-1.5">
        <Label for="message">Description:</Label>
        <Textarea
          v-model="node_obj.data.text"
          id="message"
          name="message"
          rows="5"
          placeholder="Whats the message you want to sent to the user?"
        />
      </section>
      <section class="grid grid-cols-2 gap-y-3">
        <h3 class="font-medium">Message Reply Buttons</h3>
        <ul class="col-span-full grid gap-y-3">
          <template v-for="(reply, key) in node_obj.data.buttons" :key>
            <li
              class="grid grid-cols-[1fr_var(--icon-size)] grid-rows-2 items-center [--icon-size:theme(spacing.9)] *:leading-none"
            >
              <p class="text-xs">{{ reply.title }}</p>
              <strong>{{ reply.type }}</strong>
              <button
                type="button"
                class="col-start-2 row-span-full grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5"
              >
                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
              </button>
            </li>
          </template>
          <Button
            size="sm"
            variant="outline"
            class="border-2 border-dashed !bg-none"
            @click="handleChangeSheetState('create-reply-button')"
          >
            <p>Create Reply Button</p>
          </Button>
        </ul>
      </section>
      <section class="grid grid-cols-2 gap-y-3">
        <h3 class="font-medium">Quick Replies Buttons</h3>
        <ul class="col-span-full grid gap-y-3">
          <template v-for="(quickReply, key) in node_obj.data.quick_replies" :key>
            <li
              class="grid grid-cols-[1fr_var(--icon-size)] items-center [--icon-size:theme(spacing.9)] *:leading-none"
            >
              <p>{{ quickReply.title }}</p>
              <button
                type="button"
                class="grid size-[var(--icon-size)] place-content-center rounded-lg hover:bg-primary/5"
              >
                <Icon icon="bx:dots-vertical-rounded" class="size-5" />
              </button>
            </li>
          </template>
          <Button
            size="sm"
            variant="outline"
            class="border-2 border-dashed !bg-none"
            @click="handleChangeSheetState('create-quick-reply-button')"
          >
            <p>Create Quick Reply Button</p>
          </Button>
        </ul>
      </section>
    </main>
    <main v-else-if="sheetState === 'create-reply-button'" class="grid gap-y-6 text-sm">
      <section class="grid gap-y-1.5">
        <Label for="buttonName">Button Name</Label>
        <Input
          v-model="reply_button.data.title"
          type="text"
          name="buttonName"
          placeholder="What do you call this button"
        />
      </section>
      <section class="grid gap-y-1.5">
        <Label for="buttonName">Button Type</Label>
        <Select v-model="reply_button.data.payload">
          <SelectTrigger>
            <SelectValue placeholder="Select a button type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="web_url">Web Url</SelectItem>
              <SelectItem value="postback">Postback</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>
      <Button @click="reply_button.add_new_reply()">Create Message Reply Button</Button>
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

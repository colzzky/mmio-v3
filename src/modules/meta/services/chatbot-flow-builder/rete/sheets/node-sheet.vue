<script setup lang="ts" generic="S extends BaseSchemes, K">
import { Button } from '@/core/components/ui/button'
import { Sheet, SheetContent } from '@/core/components/ui/sheet'
import {
  NodeFlowDetailsSheet,
  SettingsTemplateSheet,
  MessageSheet,
  GenericSheet,
  CarouselSheet,
  MediaSheet,
  ConditionSheet,
  TriggerSheet,
  ImageSheet,
  AudioSheet,
  VideoSheet,
  GIFSheet,
  FileSheet,
  HTTPSheet,
  BotSheetsAPISheet,
  OpenAIEmbeddingSheet,
  ChatGPTAPISheet,
  DynamicCarouselSheet,
  UserInputSheet,
  OTNSheet,
  ProductSearchSheet,
  ActionSheet,
  TimegapSheet,
  GoToFlowSheet,
  EmailSheet,
  SMSSheet,
  FunctionSheet,
  RecurringSheet,
} from '@/modules/meta/services/chatbot-flow-builder/rete/sheets'
import { Node, type NodeType } from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { Icon } from '@iconify/vue'
import type { BaseSchemes } from 'rete'
import { reactive, watch } from 'vue'

const authWorkspaceStore = useAuthWorkspaceStore()
const { active_flow } = authWorkspaceStore
const { rete_init } = active_flow

type Data =
  | {
      id: string
      label: keyof Omit<NodeType, 'reference_node'>
    }
  | undefined
type SheetState = {
  isOpen: boolean
  data: Data

  initialState(): void
  open(): void
  close(): void
  initializeData(node: Node<keyof NodeType>): void
}
const sheet = reactive<SheetState>({
  isOpen: false,
  data: undefined,

  initialState() {
    this.isOpen = false
    this.data = undefined
  },
  open() {
    this.isOpen = true
  },
  close() {
    this.initialState()
  },
  initializeData(node) {
    if (node) {
      this.data = {
        id: node.id,
        label: node.label,
      } as Data
    }
  },
})

const componentMapping: Record<keyof Omit<NodeType, 'reference_node'>, any> = {
  message_node: MessageSheet,
  generic_node: GenericSheet,
  carousel_node: CarouselSheet,
  media_node: MediaSheet,
  condition_node: ConditionSheet,
  trigger_node: TriggerSheet,
  image_node: ImageSheet,
  audio_node: AudioSheet,
  video_node: VideoSheet,
  gif_node: GIFSheet,
  file_node: FileSheet,
  http_node: HTTPSheet,
  bot_sheets_api_node: BotSheetsAPISheet,
  openai_embedding_node: OpenAIEmbeddingSheet,
  chatgpt_api_node: ChatGPTAPISheet,
  dynamic_carousel_node: DynamicCarouselSheet,
  user_input_node: UserInputSheet,
  otn_node: OTNSheet,
  product_search_node: ProductSearchSheet,
  action_node: ActionSheet,
  timegap_node: TimegapSheet,
  go_to_flow_node: GoToFlowSheet,
  email_node: EmailSheet,
  sms_node: SMSSheet,
  function_node: FunctionSheet,
  recurring_node: RecurringSheet,
}

watch(
  () => rete_init.selected_node,
  (node) => {
    if (node) {
      sheet.initializeData(node)
    } else {
      sheet.initialState()
    }
  },
)
</script>

<template>
  <NodeFlowDetailsSheet />

  <Sheet :modal="false" :open="!rete_init.ui.selectionPanelMinimized">
    <SheetContent
      class="w-[clamp(300px,100%,15%)] overflow-y-scroll p-0 shadow-none [&>button]:hidden"
    >
      <header class="flex items-center justify-between border-b p-3">
        <div class="flex items-center gap-x-2">
          <Button @click="rete_init.ui.minimizeSelectionPanel()" size="icon" variant="ghost">
            <Icon icon="mdi:arrow-vertical-collapse" class="size-5" />
          </Button>
          <span class="flex items-center gap-x-2">
            <Icon icon="tabler:zoom" class="size-4" />
            <span class="text-sm">300%</span>
          </span>
        </div>

        <span class="flex items-center gap-x-2">
          <Button type="button" class="bg-green-500 hover:bg-green-600" size="xs">Publish</Button>
          <Button type="button" class="bg-blue-500 hover:bg-blue-600" size="xs">Save</Button>
        </span>
      </header>
      <component v-if="sheet.data" :is="componentMapping[sheet.data.label]" />
      <SettingsTemplateSheet v-else />
    </SheetContent>
  </Sheet>

  <transition name="slide-fade" mode="out-in">
    <div v-if="rete_init.ui.selectionPanelMinimized" class="fixed right-0 top-0 p-4">
      <div
        class="gap-y-0 overflow-hidden overflow-y-scroll rounded-lg bg-white p-0 shadow-none [&>button]:hidden"
      >
        <header class="flex items-center justify-between gap-12 border-b p-3">
          <div class="flex items-center gap-x-2">
            <Button @click="rete_init.ui.minimizeSelectionPanel()" size="icon" variant="ghost">
              <Icon icon="mdi:arrow-vertical-collapse" class="size-5" />
            </Button>
            <span class="flex items-center gap-x-2">
              <Icon icon="tabler:zoom" class="size-4" />
              <span class="text-sm">300%</span>
            </span>
          </div>

          <span class="flex items-center gap-x-2">
            <Button type="button" class="bg-green-500 hover:bg-green-600" size="xs">Publish</Button>
            <Button type="button" class="bg-blue-500 hover:bg-blue-600" size="xs">Save</Button>
          </span>
        </header>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>

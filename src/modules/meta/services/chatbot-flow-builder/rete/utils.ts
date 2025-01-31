import {
  Reference,
  Message,
  Generic,
  Carousel,
  Media,
  Condition,
  Image,
  Audio,
  Trigger,
  Video,
  GIF,
  File,
  HTTP,
  BotSheetsAPI,
  OpenAIEmbedding,
} from '@/modules/meta/services/chatbot-flow-builder/rete/TemplateNode'
import type { FBAttachmentTemplate } from '@/modules/meta/utils/flow-meta-types'
import type {
  CarouselCard,
  MetaTemplateOutput,
  NodeType,
  QuickReply,
  Button,
  Condition as ConditionType,
} from '@/modules/meta/utils/flow-types'
import type { Input, Output, Socket } from 'rete/_types/presets/classic'
import type { Component } from 'vue'

export function sortByIndex<T extends Output<Socket> | Input<Socket> | MetaTemplateOutput>(
  entries: [string, T | undefined][],
) {
  return entries.sort((a, b) => {
    const ai = a[1]?.index || 0
    const bi = b[1]?.index || 0
    return ai - bi
  })
}

export interface MessageReplyForm {
  form: FBAttachmentTemplate.Button
  initialState(): void

  submitForm(event: SubmitEvent): void
  createButton(): void
  updateButton(): void
  deleteButton(key: string): void

  intent: 'default' | 'create-message-reply' | 'edit-message-reply'
  buttonKey: string | null
  changeIntent(
    args:
      | { intent: 'default' | 'create-message-reply' }
      | { intent: 'edit-message-reply'; key: string; reply: Button },
  ): void
}

export interface QuickReplyForm {
  form: FBAttachmentTemplate.QuickReply
  initialState(): void

  submitForm(event: SubmitEvent): void
  createButton(): void
  updateButton(): void
  deleteButton(key: string): void
  deleteAllButtons(): void

  intent: 'default' | 'create-quick-reply' | 'edit-quick-reply'
  buttonKey: string | null
  changeIntent(
    args:
      | { intent: 'default' | 'create-quick-reply' }
      | { intent: 'edit-quick-reply'; key: string; quickReply: QuickReply },
  ): void
}

export interface CarouselCardForm {
  form: CarouselCard
  buttonForm: Button
  formInitialState(): void
  buttonFormInitialState(): void
  initialState(): void

  submitForm(event: SubmitEvent): void

  createButton(): void
  updateButton(): void
  deleteButton(key: string): void

  createCard(): void
  updateCard(): void
  deleteCard(key: number): void

  intent:
    | 'default'
    | 'create-carousel-card'
    | 'edit-carousel-card'
    | 'create-carousel-card-button'
    | 'edit-carousel-card-button'
  cardKey: number | null
  buttonKey: string | null
  changeIntent(
    args:
      | { intent: 'default' | 'create-carousel-card' | 'create-carousel-card-button' }
      | { intent: 'edit-carousel-card-button'; key: string; button: Button }
      | { intent: 'edit-carousel-card'; key: number; card?: CarouselCard },
  ): void
}

export interface ConditionForm {
  form: ConditionType
  initialState(): void

  submitForm(event: SubmitEvent): void
  createCondition(): void
  updateCondition(): void
  deleteCondition(key: number): void

  intent: 'default' | 'create-condition' | 'edit-condition'
  conditionKey: number | null
  changeIntent(
    args:
      | { intent: 'default' | 'create-condition' }
      | { intent: 'edit-condition'; key: number; condition: ConditionType },
  ): void
}

export const nodeMapping: Record<keyof NodeType, Component> = {
  reference_node: Reference,
  message_node: Message,
  generic_node: Generic,
  carousel_node: Carousel,
  media_node: Media,
  trigger_node: Trigger,
  condition_node: Condition,
  image_node: Image,
  audio_node: Audio,
  video_node: Video,
  gif_node: GIF,
  file_node: File,
  http_node: HTTP,
  bot_sheets_api_node: BotSheetsAPI,
  openai_embedding_node: OpenAIEmbedding,
}

export const nodeIconMapping: Record<keyof NodeType, string> = {
  reference_node: 'bx:bolt-circle',
  message_node: 'bx:message',
  generic_node: 'solar:posts-carousel-horizontal-bold-duotone',
  carousel_node: 'solar:posts-carousel-horizontal-bold',
  media_node: 'bxs:videos',
  trigger_node: 'bxs:bolt',
  condition_node: 'ix:logic-diagram',
  image_node: 'bx:image',
  audio_node: 'gridicons:audio',
  video_node: 'bx:video',
  gif_node: 'stash:gif-solid',
  file_node: 'bx:file',
  http_node: 'material-symbols:http',
  bot_sheets_api_node: 'healthicons:spreadsheets',
  openai_embedding_node: 'mingcute:openai-fill',
}

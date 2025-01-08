import type { FBAttachmentTemplate } from '@/modules/meta/utils/flow-meta-types'
import type {
  CarouselCard,
  MetaTemplateOutput,
  NodeType,
  QuickReply,
  Button as MetaButton,
  Button,
  Condition,
} from '@/modules/meta/utils/flow-types'
import type { Input, Output, Socket } from 'rete/_types/presets/classic'

export function sortByIndex<T extends Output<Socket> | Input<Socket> | MetaTemplateOutput>(
  entries: [string, T | undefined][],
) {
  return entries.sort((a, b) => {
    const ai = a[1]?.index || 0
    const bi = b[1]?.index || 0
    return ai - bi
  })
}

export function dispatchTriggerNodeSheetEvent(args: { id: string; label: keyof NodeType } | null) {
  document.dispatchEvent(
    new CustomEvent('triggerNodeSheet', {
      detail: args,
    }),
  )
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
      | { intent: 'edit-message-reply'; key: string; reply: MetaButton },
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
  form: Condition
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
      | { intent: 'edit-condition'; key: number; condition: Condition },
  ): void
}

import type { RestApiTypes, SubCollections } from '../../../core/types/UniTypes'
import type { FBAttachmentTemplate } from './flow-meta-types'
import { toast } from '@/core/components/ui/toast'
import { ClassicPreset, type GetSchemes } from 'rete'
import type { VueArea2D } from 'rete-vue-plugin'
import type { Input, Output } from 'rete/_types/presets/classic'

export interface NodeType {
  message_node: MessageNode
  generic_node: GenericNode
  carousel_node: CarouselNode
  reference_node: ReferenceNode
  media_node: MediaNode
  condition_node: ConditionNode
  image_node: ImageNode
  audio_node: AudioNode
  trigger_node: TriggerNode
  video_node: VideoNode



  gif_node: GIFNode
  file_node: FileNode
  http_node: HTTPNode
  
  bot_sheets_api_node: BotSheetsAPINode //Skip for now
  openai_embedding_node: OpenAIEmbeddingNode //Skip for now
  chatgpt_api_node: ChatGPTAPINode //Skip for now
  dynamic_carousel_node: DynamicCarouselNode //Skip for now
  user_input_node: UserInputNode //Skip for now
  
  otn_node: OTNNode
  product_search_node: ProductSearchNode
  action_node: ActionNode //Skip for now
  timegap_node: TimegapNode
  go_to_flow_node: GoToFlowNode
  email_node: EmailNode //Skip for now 
  sms_node: SMSNode
  function_node: FunctionNode //Skip for now
  recurring_node: RecurringNode // Skip for now
}

export interface CarouselCard {
  image: string
  image_aspect_ratio: string
  title: string
  text: string
  buttons: Record<string, Button>
}

export interface Button {
  type: 'web_url' | 'postback'
  title: string
  url?: string // Optional because 'postback' type doesn't require it
  messenger_extensions?: 'TRUE' | 'FALSE' // Optional for web_url type
  payload?: string // Optional because 'web_url' doesn't need payload
}

export interface QuickReply {
  content_type: 'text' | 'user_email' | 'user_phone_number'
  title?: string
  payload?: string
}

export interface ReferenceNode {
  name: string
  postbackid?: string
  giver_data: Record<string, string>
}
export interface GenericNode extends CarouselCard {
  name: string
  postbackid?: string
  delay?: string
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
export interface CarouselNode {
  name: string
  postbackid?: string
  delay?: string
  cards: CarouselCard[]
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface MessageNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface MediaNode {
  name: string
  url: string
  type: string
  delay?: string
  postbackid?: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface Condition {
  label: string
  type: string
  qualifier: string
  value: any
}

export interface ConditionNode {
  name: string
  conditions: Condition[]
  type: string
  delay?: string
  postbackid?: string
  giver_data: Record<string, string>
}

export interface ImageNode {
  name: string
  url: string
  type: string
  delay?: string
  postbackid?: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface AudioNode {
  name: string
  url: string
  type: string
  delay?: string
  postbackid?: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface TriggerNode {
  name: string
  trigger_type: string
  trigger_keyword?: string
  keyword_strictness?: string
  postbackid?: string
  giver_data: Record<string, string>
}

export interface VideoNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface GIFNode {
  name: string
  postbackid?: string
  delay?: string
  image: string
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface FileNode {
  name: string
  postbackid?: string
  delay?: string
  file: string
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface HTTPNode {
  name: string
  postbackid?: string
  delay?: string
  giver_data: Record<string, string>

  body: string
  map: Record<string, string>
  params: { key: string, value: string }[]
  headers: { key: string, value: string }[]
  type: RestApiTypes,
  subscribe_id: string,
  url: string
}
//SKIP FOR NOW
export interface BotSheetsAPINode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
//SKIP FOR NOW
export interface OpenAIEmbeddingNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
//SKIP FOR NOW
export interface ChatGPTAPINode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
//SKIP FOR NOW
export interface DynamicCarouselNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
//SKIP FOR NOW
export interface UserInputNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface OTNNode {
  name: string
  postbackid?: string
  delay?: string
  action: string,
  giver_data: Record<string, string>,
  otnTitle: string,
  otnName?: string,
  existing?: string,
}

export interface ProductSearchNode {
  name: string
  postbackid?: string
  delay?: string
  cta: string
  store_id: string
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

//Skip for now
export interface ActionNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

//Generate its own postback
export interface TimegapNode {
  name: string
  postbackid?: string
  giver_data: Record<string, string>
  value: number
  unit: string
  from: string
  to: string
  timezone: string
  tag: string
  send_node: string
  recurring_id: string
  otn: string
}

//No num1
export interface GoToFlowNode {
  name: string
  postbackid?: string
  delay?: string
  flow: string
  payload: string
  giver_data: Record<string, string>
}

//Skip for now
export interface EmailNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface SMSNode {
  name: string
  postbackid?: string
  giver_data: Record<string, string>
  body: string
  sender_id: string
  to: string
}

//skid for now
export interface FunctionNode {
  name: string
  postbackid?: string
  delay?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}

export interface RecurringNode {
  name: string
  postbackid?: string
  delay?: string
  giver_data: Record<string, string>
  config: {
    image_url: string,
    title: string,
    notification_messages_frequency: string,
    notification_messages_reoptin: string,
    notification_messages_timezone: string
  },
  id: string
  recurring_name: string
}

export class Node<T extends keyof NodeType> extends ClassicPreset.Node<
  Record<string, CustomSocket>, // Inputs
  Record<string, CustomSocket>, // Outputs
  Record<string, ControlInterface> // Controls
> {
  data?: NodeType[T] // Dynamically infer the type of 'data' based on 'T'
  label: T

  constructor(label: T) {
    super(label) // Call the constructor of the base class (ClassicPreset.Node)
    this.label = label
  }
}

export function isNodeOfType<T extends keyof NodeType>(
  node: Node<keyof NodeType>,
  label: T,
): node is Node<T> {
  return node.label === label
}

export type ControlInterface =
  | CustomControls.Test
  | ClassicPreset.InputControl<'number'>
  | ClassicPreset.InputControl<'text'>
export namespace CustomControls {
  interface SampleInput {
    label: string
    placeholder: string
  }
  export class Test extends ClassicPreset.Control {
    public type = 'testControl'
    public details: SampleInput

    constructor(_details: SampleInput) {
      super()
      this.details = _details
    }
  }

  //Add more custom control here
}

export interface ConnectionProperty {
  source: string
  sourceOutput: string
  target: string
  targetInput: string
}

export class Connection<A extends Node<keyof NodeType>> extends ClassicPreset.Connection<A, A> { }

export type Schemes = GetSchemes<Node<keyof NodeType>, Connection<Node<keyof NodeType>>>
export type AreaExtra = VueArea2D<Schemes>

/////////////////////
// RETE Templates //
///////////////////

//Rete Templates are pre determined nodes, control, input and outputs
export namespace ReteTemplates {
  export const control_types = ['text', 'number', 'testControl'] as const
  export const control_template: Record<(typeof control_types)[number], ControlInterface> = {
    text: new ClassicPreset.InputControl('text', {
      initial: '',
      change(value) {
        console.log(value)
      },
    }),
    number: new ClassicPreset.InputControl('number', {
      initial: 0,
    }),
    testControl: new CustomControls.Test({
      label: 'Hello World',
      placeholder: 'Enter a valuess',
    }),
  }
  //These are the templates needed to create a Facebook Node
  export const node_templates = {
    reference_node() {
      const node = new Node('reference_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'reference',
        giver_data: {
          num1: num1_postback,
        },
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['Accept All'],
        },
        'num1',
      )

      return node
    },
    trigger_node() {
      const node = new Node('trigger_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Trigger Node',
        keyword_strictness: 'wide',
        trigger_type: 'keyword',
        trigger_keyword: '',
        giver_data: {
          num1: num1_postback,
        },
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['triggers'],
        },
        'num1',
      )
      return node
    },
    text_node() {
      const node = new Node('message_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: '',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    generic_node() {
      const node = new Node('generic_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Generic Node',
        image:
          'https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=925&format=pjpg&exif=1&iptc=1%201x,%20https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=750&format=pjpg&exif=1&iptc=1%202x',
        image_aspect_ratio: 'horizontal',
        title: 'Sample Title',
        text: 'Sample Description',
        giver_data: {},
        quick_replies: {},
        buttons: {},
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['carousel'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['carousel'],
        },
        'num1',
      )
      return node
    },
    carousel_node() {
      const node = new Node('carousel_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Carousel Node',
        cards: [
          {
            image:
              'https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=925&format=pjpg&exif=1&iptc=1%201x,%20https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=750&format=pjpg&exif=1&iptc=1%202x',
            image_aspect_ratio: 'horizontal',
            title: 'Sample Title',
            text: 'Sample Description',
            buttons: {},
          },
        ],
        giver_data: {},
        quick_replies: {},
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['carousel'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['carousel'],
        },
        'num1',
      )
      return node
    },
    media_node() {
      const node = new Node('media_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Media Node',
        url: '',
        type: '',
        giver_data: {},
        quick_replies: {},
        buttons: {},
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['facebookmedia'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['facebookmedia'],
        },
        'num1',
      )
      return node
    },
    image_node() {
      const node = new Node('image_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Image Node',
        url: '',
        type: '',
        giver_data: {},
        quick_replies: {},
        buttons: {},
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['image'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['image'],
        },
        'num1',
      )
      return node
    },
    audio_node() {
      const node = new Node('audio_node')
      const num1_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Audio Node',
        url: '',
        type: '',
        giver_data: {},
        quick_replies: {},
        buttons: {},
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['audio'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['audio'],
        },
        'num1',
      )
      return node
    },
    condition_node() {
      const node = new Node('condition_node')
      const num1_postback = crypto.randomUUID()
      const num2_postback = crypto.randomUUID()
      node.id = crypto.randomUUID()
      node.data = {
        name: 'Untitled Condition Node',
        type: '',
        giver_data: {
          num1: num1_postback,
          num2: num2_postback,
        },
        delay: '',
        conditions: [],
        postbackid: crypto.randomUUID(),
      }
      node.id = crypto.randomUUID()
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['condition'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['condition'],
        },
        'num1',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['condition'],
        },
        'num2',
      )
      return node
    },
    video_node() {
      const node = new Node('video_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Video Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },


    gif_node() {
      const node = new Node('gif_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled GIF Node',
        image: '',
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['image'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['image'],
        },
        'num1',
      )
      return node
    },
    file_node() {
      const node = new Node('file_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled File Node',
        file: '',
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['file'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['file'],
        },
        'num1',
      )
      return node
    },
    http_node() {
      const node = new Node('http_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled HTTP Node',
        giver_data: {},
        body: '',
        map: {},
        params: [],
        headers: [],
        type: 'GET',
        subscribe_id: '',
        url: '',
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    bot_sheets_api_node() {
      const node = new Node('bot_sheets_api_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Bot Sheets API Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    openai_embedding_node() {
      const node = new Node('openai_embedding_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled OpenAI Embedding Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    chatgpt_api_node() {
      const node = new Node('chatgpt_api_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled ChatGPT API Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    dynamic_carousel_node() {
      const node = new Node('dynamic_carousel_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Dynamic Carousel Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    user_input_node() {
      const node = new Node('user_input_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled User Input Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    otn_node() {
      const node = new Node('otn_node')
      node.id = crypto.randomUUID()
      const button_otn_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled OTN Node',
        action: '',
        giver_data: {
          button_otn: button_otn_postback
        },
        otnTitle: '',
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['otn'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['otn'],
        },
        'button_otn',
      )
      return node
    },
    product_search_node() {
      const node = new Node('product_search_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Product Search Node',
        quick_replies: {},
        giver_data: {},
        cta: '',
        store_id: ''
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    action_node() {
      const node = new Node('action_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Action Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    timegap_node() {
      const node = new Node('timegap_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Timegap Node',
        giver_data: {
          num1: num1_postback
        },
        value: 0,
        unit: '',
        from: '00',
        to: '00',
        timezone: '',
        tag: '',
        send_node: '',
        recurring_id: '',
        otn: '',
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['timegap'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['timegap'],
        },
        'num1',
      )
      return node
    },
    go_to_flow_node() {
      const node = new Node('go_to_flow_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Go To Flow Node',
        giver_data: {},
        flow:'',
        payload:''
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['triggers'],
        },
        'num',
        'input',
      )
      return node
    },
    email_node() {
      const node = new Node('email_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Email Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    sms_node() {
      const node = new Node('sms_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled SMS Node',
        giver_data: {},
        body:'',
        sender_id:'',
        to:''
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    function_node() {
      const node = new Node('function_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Function Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
    recurring_node() {
      const node = new Node('recurring_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Recurring Node',
        giver_data: {},
        config: {
          image_url: '',
          title: '',
          notification_messages_frequency: '',
          notification_messages_reoptin: '',
          notification_messages_timezone: '',
        },
        id: '',
        recurring_name: '',
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },

    //Should be generic node
    message_node() {
      const node = new Node('message_node')
      node.id = crypto.randomUUID()
      const num1_postback = crypto.randomUUID()
      node.data = {
        name: 'Untitled Message Node',
        text: '',
        buttons: {},
        quick_replies: {},
        giver_data: {},
      }
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num',
        'input',
      )
      createMetaTemplateOutIn(
        {
          node,
          socket: ReteSockets['text'],
        },
        'num1',
      )
      return node
    },
  }
}

//Serialized State. This is the typ used when saving and populating rete editor
export namespace SerializedFlow {
  export interface Node<T extends keyof NodeType> {
    id: string
    label: keyof NodeType
    controls: Record<string, ControlInterface>
    outputs: Record<string, Output<CustomSocket> | undefined>
    inputs: Record<string, Input<CustomSocket> | undefined>
    position: { x: number; y: number }
    data: NodeType[T] | null
  }

  export interface Connection {
    id: string
    source: string
    sourceOutput: string
    target: string
    targetInput: string
  }

  export interface State {
    nodes: Node<keyof NodeType>[]
    connections: Connection[]
    signal: any
    name: string
  }
}

//////////////////////////
// Flow Data Templates //
// Not yet being used //
///////////////////////

export interface FlowData extends SubCollections {
  flow_id: string
  editor_data: string // This is where we save the rete editor Data
  flow_node_data: FlowNodeData[] // This is where we save the extracted nodes that will be use by FB Must be a subcollection
  subCollections: 'node_refs'[]
  createdAt: string
  updatedAt: string
}

export interface FlowNodeData {
  node_id: string
  message_type: string
  message_data: {
    message_id: string
    text?: string
    attachment?: FBAttachmentTemplate.Attachment
    quick_replies?: {
      content_type: string
      title?: string
      payload?: string // This is the postback payload that will call another node ID
      //{flow_id:'sample-id',node_id:'sample-node-id',quick_reply_id:'sample-qr-id'}
    }[]
  }
  // Can be quick replies or buttons
  postback_data: { origin: string; postback: string }[]
  createdAt: string
  updatedAt: string
}

/////////////////////////////////////
// CUSTOM INPUT OUTPUT AND SOCKET //
///////////////////////////////////

type MetaTemplateOutputConstructorArgs = {
  socket: CustomSocket
  key: string
} // Dynamically adds fields based on the 'type' passed

type createMetaTemplateOutInArgs = {
  node: Node<keyof NodeType>
  socket: CustomSocket
}

// Factory function to create a MetaTemplateOutput dynamically based on type
export function createMetaTemplateOutIn(
  args: createMetaTemplateOutInArgs,
  outKey: string = '',
  type: 'output' | 'input' = 'output',
) {
  const key = !outKey ? `${args.socket.name}_${crypto.randomUUID()}` : outKey // Create a unique key for the output
  if (type === 'input')
    args.node.addInput(key, new MetaTemplateInput({ socket: args.socket, key })) // Add the output to the node
  else args.node.addOutput(key, new MetaTemplateOutput({ socket: args.socket, key })) // Add the output to the node
  return { args, key } // Return the arguments and the output key
}

export class MetaTemplateOutput extends ClassicPreset.Output<CustomSocket> {
  id: string
  label: string
  constructor(args: MetaTemplateOutputConstructorArgs) {
    super(args.socket) // Initialize with socket
    this.id = args.key // Set the ID (provided as part of args)
    this.label = args.socket.name // Set the ID (provided as part of args)
    this.multipleConnections = false
  }
}

export class MetaTemplateInput extends ClassicPreset.Input<CustomSocket> {
  id: string
  label: string
  constructor(args: MetaTemplateOutputConstructorArgs) {
    super(args.socket) // Initialize with socket
    this.id = args.key // Set the ID (provided as part of args)
    this.label = args.socket.name // Set the ID (provided as part of args)
    this.multipleConnections = true
  }
}

const socketNames = [
  'button',
  'quickreply',
  'quickreplyToSequence',
  'carouselItem',
  'carousel',
  'text',
  'image',
  'video',
  'file',
  'facebookmedia',
  'delay',
  'audio',
  'delayO',
  'Esequence',
  'Ssequence',
  'newMessageSet',
  'newMessageSetO',
  'buttonsOnly',
  'newMessageSetO2',
  'labels',
  'triggers',
  'CarouselQR',
  'userinput',
  'otn',
  'SsequenceO',
  'EsequenceO',
  'Msequence',
  'condition',
  'timegap',
  'actions',
  'actionsO',
  'Elements Input',
  'Elements Output',
  'Elements Only Output',
  'Accept All',
  'UserInput Only Input',
  'UserInput Output',
  'test',
] as const

export const socketDefinitions: Record<
  (typeof socketNames)[number],
  (typeof socketNames)[number][]
> = {
  test: [],
  'Elements Input': [],
  'UserInput Only Input': [],
  'Accept All': [],
  button: [
    'text',
    'carouselItem',
    'carousel',
    'file',
    'image',
    'video',
    'facebookmedia',
    'newMessageSet',
    'condition',
    'actions',
    'Elements Input',
    'Accept All',
  ],
  quickreply: [
    'carouselItem',
    'carousel',
    'file',
    'image',
    'video',
    'facebookmedia',
    'newMessageSet',
    'condition',
    'actions',
    'Elements Input',
    'userinput',
    'Accept All',
  ],
  carouselItem: [
    'text',
    'carousel',
    'quickreply',
    'image',
    'file',
    'video',
    'facebookmedia',
    'delay',
    'timegap',
    'actions',
    'Accept All',
  ],
  carousel: [
    'carouselItem',
    'carousel',
    'file',
    'image',
    'video',
    'facebookmedia',
    'delay',
    'newMessageSet',
    'userinput',
    'otn',
    'condition',
    'timegap',
    'actions',
    'Accept All',
  ],
  actions: [
    'carouselItem',
    'carousel',
    'file',
    'image',
    'video',
    'facebookmedia',
    'delay',
    'newMessageSet',
    'userinput',
    'otn',
    'condition',
    'Elements Input',
    'Accept All',
  ],
  text: [
    'text',
    'quickreply',
    'carouselItem',
    'carousel',
    'file',
    'image',
    'video',
    'facebookmedia',
    'delay',
    'newMessageSet',
    'userinput',
    'otn',
    'condition',
    'timegap',
    'actions',
    'Elements Input',
    'Accept All',
  ],
  triggers: ['Elements Input', 'Accept All'],
  image: [
    'carouselItem',
    'carousel',
    'text',
    'facebookmedia',
    'delay',
    'file',
    'video',
    'timegap',
    'actions',
    'Accept All',
  ],
  video: [
    'carouselItem',
    'carousel',
    'text',
    'image',
    'file',
    'video',
    'facebookmedia',
    'delay',
    'timegap',
    'actions',
    'Accept All',
  ],
  audio: [
    'carouselItem',
    'carousel',
    'text',
    'image',
    'file',
    'video',
    'facebookmedia',
    'delay',
    'timegap',
    'actions',
    'Accept All',
  ],
  file: [
    'text',
    'facebookmedia',
    'delay',
    'file',
    'video',
    'carouselItem',
    'carousel',
    'image',
    'timegap',
    'actions',
    'Accept All',
  ],
  facebookmedia: [
    'quickreply',
    'carousel',
    'text',
    'image',
    'file',
    'video',
    'delay',
    'carouselItem',
    'timegap',
    'actions',
    'Accept All',
  ],
  delay: [
    'text',
    'image',
    'file',
    'video',
    'facebookmedia',
    'carousel',
    'carouselItem',
    'actions',
    'Accept All',
  ],
  delayO: [
    'text',
    'image',
    'file',
    'video',
    'facebookmedia',
    'carousel',
    'carouselItem',
    'actions',
    'Accept All',
  ],
  Msequence: [],
  Esequence: [],
  Ssequence: [],
  newMessageSet: [],
  newMessageSetO: [
    'text',
    'carousel',
    'file',
    'image',
    'video',
    'carouselItem',
    'facebookmedia',
    'delay',
    'actions',
    'Accept All',
  ],
  buttonsOnly: ['quickreply', 'button', 'actions', 'Accept All'],
  newMessageSetO2: ['Msequence'],
  labels: [],
  CarouselQR: ['quickreply'],
  userinput: [],
  otn: [],
  SsequenceO: ['Ssequence'],
  EsequenceO: ['Esequence'],
  quickreplyToSequence: ['Esequence', 'Ssequence', 'Accept All'],
  condition: ['newMessageSet', 'actions', 'Accept All'],
  actionsO: ['Elements Input', 'text', 'Accept All'],
  'Elements Only Output': ['actions', 'Elements Input', 'Accept All'],
  'Elements Output': ['actions', 'timegap', 'userinput', 'Elements Input', 'Accept All'],
  'UserInput Output': [
    'actions',
    'timegap',
    'userinput',
    'Elements Input',
    'Accept All',
    'UserInput Only Input',
  ],
  timegap: [],
}

export class CustomSocket extends ClassicPreset.Socket {
  private compatibility: Set<string>
  private reverseCompatibilityMap: Map<string, Set<string>>

  constructor(name: string, compatibility: string[]) {
    super(name)
    this.compatibility = new Set(compatibility)
    // Create the reverse compatibility map dynamically.
    this.reverseCompatibilityMap = new Map()
    compatibility.forEach((item) => {
      if (!this.reverseCompatibilityMap.has(item)) {
        this.reverseCompatibilityMap.set(item, new Set())
      }
      this.reverseCompatibilityMap.get(item)?.add(name)
    })
  }

  isCompatibleWith(socket: CustomSocket) {
    // First, check if the socket name exists in the reverse map for fast lookup.
    if (this.reverseCompatibilityMap.has(socket.name)) {
      return true
    }
    // Fallback to the old method (checking compatibility array directly).
    return (
      socket instanceof CustomSocket &&
      (this.compatibility.has(socket.name) || socket.compatibility.has(this.name))
    )
  }
}

// Dynamically create and instantiate sockets
export const ReteSockets = Object.fromEntries(
  Object.entries(socketDefinitions).map(([name, compatibleWith]) => [
    name,
    new CustomSocket(name, [...compatibleWith]),
  ]),
) as Record<keyof typeof socketDefinitions, CustomSocket>

export async function copyPostback(item_copy: string) {
  try {
    if (item_copy) await navigator.clipboard.writeText(`${item_copy}`)
    toast({
      title: 'Postback Id Copied',
      variant: 'default',
      duration: 2000,
    })
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

export const nodeMapContextMenu: Record<
  string,
  { label: string; key: string; template: keyof NodeType; icon: string }
> = {
  reference: { label: 'Reference', key: '1', template: 'reference_node', icon: 'bx:bolt-circle' },
  message: { label: 'Message', key: '2', template: 'message_node', icon: 'bx:message' },
  generic: {
    label: 'Generic',
    key: '9',
    template: 'generic_node',
    icon: 'solar:posts-carousel-horizontal-bold',
  },
  carousel: {
    label: 'Carousel',
    key: '3',
    template: 'carousel_node',
    icon: 'solar:posts-carousel-horizontal-bold-duotone',
  },
  media: { label: 'Media', key: '4', template: 'media_node', icon: 'bxs:videos' },
  condition: { label: 'Condition', key: '5', template: 'condition_node', icon: 'ix:logic-diagram' },
  image: { label: 'Image', key: '6', template: 'image_node', icon: 'bx:image' },
  audio: { label: 'Audio', key: '7', template: 'audio_node', icon: 'gridicons:audio' },
  trigger: { label: 'Trigger', key: '8', template: 'trigger_node', icon: 'bx:bolt-circle' },
  video: { label: 'Video', key: '9', template: 'video_node', icon: 'bx:video' },
  gif: { label: 'GIF', key: '10', template: 'gif_node', icon: 'stash:gif-solid' },
  file: { label: 'File', key: '11', template: 'file_node', icon: 'bx:file' },
  http: { label: 'HTTP', key: '12', template: 'http_node', icon: 'material-symbols:http' },

  // key depends on lowered-case `label`
  'bot sheets api': {
    label: 'Bot Sheets API',
    key: '13',
    template: 'bot_sheets_api_node',
    icon: 'healthicons:spreadsheets',
  },
  'openai embedding': {
    label: 'OpenAI Embedding',
    key: '14',
    template: 'openai_embedding_node',
    icon: 'logos:openai',
  },
  'chatgpt api': {
    label: 'ChatGPT API',
    key: '15',
    template: 'chatgpt_api_node',
    icon: 'arcticons:openai-chatgpt',
  },
  'dynamic carousel': {
    label: 'Dynamic Carousel',
    key: '16',
    template: 'dynamic_carousel_node',
    icon: 'solar:posts-carousel-vertical-bold',
  },
  'user input': {
    label: 'User Input',
    key: '17',
    template: 'user_input_node',
    icon: 'radix-icons:input',
  },
  otn: {
    label: 'OTN',
    key: '18',
    template: 'otn_node',
    icon: 'bx:bell',
  },
  'product search': {
    label: 'Product Search',
    key: '19',
    template: 'product_search_node',
    icon: 'bx:search',
  },
  action: {
    label: 'Action',
    key: '20',
    template: 'action_node',
    icon: 'mdi:call-to-action',
  },
  timegap: {
    label: 'Timegap',
    key: '21',
    template: 'timegap_node',
    icon: 'ph:spinner-gap-fill',
  },
  'go to flow': {
    label: 'Go To Flow',
    key: '22',
    template: 'go_to_flow_node',
    icon: 'ix:goto',
  },
  email: {
    label: 'Email',
    key: '23',
    template: 'email_node',
    icon: 'bx:envelope',
  },
  sms: {
    label: 'SMS',
    key: '24',
    template: 'sms_node',
    icon: 'fa-solid:sms',
  },
  function: {
    label: 'Function',
    key: '25',
    template: 'function_node',
    icon: 'material-symbols:function',
  },
  recurring: {
    label: 'Recurring',
    key: '26',
    template: 'recurring_node',
    icon: 'wpf:recurring-appointment',
  },
}

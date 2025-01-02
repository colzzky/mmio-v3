import { toast } from '@/core/components/ui/toast'
import type { SubCollections } from '../../../core/types/UniTypes'
import type { FBAttachmentTemplate } from './flow-meta-types'
import { ClassicPreset, type GetSchemes } from 'rete'
import type { VueArea2D } from 'rete-vue-plugin'
import type { Input, Output } from 'rete/_types/presets/classic'

export interface NodeType {
  message_node: MessageNode
  generic_node: GenericNode
  carousel_node: CarouselNode
  reference_node: ReferenceNode
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
  content_type: "text" | "user_email" | "user_phone_number",
  title?: string,
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
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
export interface CarouselNode {
  name: string
  postbackid?: string
  cards: CarouselCard[]
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
}
interface MessageNode {
  name: string
  postbackid?: string
  text: string
  buttons: Record<string, Button>
  quick_replies: Record<string, QuickReply>
  giver_data: Record<string, string>
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
          'num1': num1_postback
        },
      }
      createMetaTemplateOutIn({
        node,
        socket: ReteSockets['Accept All'],
      }, 'num1')

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
        giver_data: {
          'num1': num1_postback
        },
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
        image: 'https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=925&format=pjpg&exif=1&iptc=1%201x,%20https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=750&format=pjpg&exif=1&iptc=1%202x',
        image_aspect_ratio: 'horizontal',
        title: 'Sample Title',
        text: 'Sample Description',
        giver_data: {
          'num1': num1_postback
        },
        quick_replies: {},
        buttons: {}
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
        cards:[
          {
            image: 'https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=925&format=pjpg&exif=1&iptc=1%201x,%20https://burst.shopifycdn.com/photos/young-boy-smiles-at-father-holding-baby-sister.jpg?width=750&format=pjpg&exif=1&iptc=1%202x',
            image_aspect_ratio: 'horizontal',
            title: 'Sample Title',
            text: 'Sample Description',
            buttons: {}
          }
        ],
        giver_data: {
          'num1': num1_postback
        },
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
        giver_data: {
          'num1': num1_postback
        },
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
  export interface Node {
    id: string
    label: string
    controls: { [key: string]: ControlInterface }
    outputs: { [key: string]: MetaTemplateOutput } | undefined
    inputs: { [key: string]: Input<ClassicPreset.Socket> } | undefined
    position: { x: number; y: number }
    data: any
  }

  export interface Connection {
    id: string
    source: string
    sourceOutput: string
    target: string
    targetInput: string
  }

  export interface State {
    nodes: Node[]
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
  button: ["text", "carouselItem", "carousel", "file", "image", "video", "facebookmedia", "newMessageSet", "condition", "actions", "Elements Input", "Accept All"],
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
    if (item_copy)
      await navigator.clipboard.writeText(`${item_copy}`)
    toast({
      title: 'Postback Id Copied',
      variant: 'default',
      duration: 2000,
    })
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}
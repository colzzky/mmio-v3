import { ClassicPreset, type GetSchemes } from 'rete'
import type { VueArea2D } from 'rete-vue-plugin'
import type { Input, Output } from 'rete/_types/presets/classic'

export class Node extends ClassicPreset.Node<
  Record<string, ClassicPreset.Socket>,
  Record<string, ClassicPreset.Socket>,
  Record<string, ControlInterface>
> {
  data?: any // Add the 'data' property directly as part of the class
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

export class Connection<A extends Node> extends ClassicPreset.Connection<A, A> {}

export type Schemes = GetSchemes<Node, Connection<Node>>
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
    custom_node(socket: ClassicPreset.Socket) {
      const node = new Node('Custom')
      node.id = crypto.randomUUID()
      node.addControl('input', control_template.text)
      node.addControl('input2', control_template.number)
      node.addControl('test', control_template.testControl)

      node.data = {
        details: 'Hello World',
        content: 'Enter a This is a content',
      }
      node.addOutput('socket', new ClassicPreset.Output(socket))
      node.addInput('socket', new ClassicPreset.Input(socket))
      node.addInput('socket2', new ClassicPreset.Input(socket))

      return node
    },
    reference_node(socket: ClassicPreset.Socket) {
      const node = new Node('reference_node')
      node.id = crypto.randomUUID()
      node.addOutput(
        `output_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'sample label' }),
      )
      return node
    },
    text_node(socket: ClassicPreset.Socket) {
      const node = new Node('text_node')
      node.id = crypto.randomUUID()
      node.addOutput('socket', new ClassicPreset.Output(socket))
      node.addOutput('socket1', new ClassicPreset.Output(socket))
      return node
    },
    message_node(socket: ClassicPreset.Socket) {
      const node = new Node('message_node')
      node.id = crypto.randomUUID()
      node.addInput(`input_${crypto.randomUUID()}`, new ClassicPreset.Input(socket, 'hello', true))

      // replies
      node.addOutput(
        `output_reply_${crypto.randomUUID()}`,
        new CustomOutput({
          socket,
          type: 'reply',
          question: 'Message Question #1',
          answer: 'Message Answer #1',
        }),
      )
      node.addOutput(
        `output_reply_${crypto.randomUUID()}`,
        new CustomOutput({
          socket,
          type: 'reply',
          question: 'Message Question #2',
          answer: 'Message Answer #2',
        }),
      )

      // quick replies
      node.addOutput(
        `output_quickReply_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'Message Quick Reply #1' }),
      )
      node.addOutput(
        `output_quickReply_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'Message Quick Reply #2' }),
      )
      node.addOutput(
        `output_quickReply_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'Message Quick Reply #3' }),
      )

      return node
    },
    carousel_node(socket: ClassicPreset.Socket) {
      const node = new Node('carousel_node')
      node.id = crypto.randomUUID()
      node.addInput(`input_${crypto.randomUUID()}`, new ClassicPreset.Input(socket, 'hello', true))

      // cards
      node.addOutput(
        `output_card_${crypto.randomUUID()}`,
        new CustomOutput({
          socket,
          type: 'card',
          question: 'Carousel Question #1',
          answer: 'Carousel Answer #1',
          image: '',
        }),
      )
      node.addOutput(
        `output_card_${crypto.randomUUID()}`,
        new CustomOutput({
          socket,
          type: 'card',
          question: 'Carousel Question #2',
          answer: 'Carousel Answer #2',
          image: '',
        }),
      )

      // quick replies
      node.addOutput(
        `output_quickReply_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'Carousel Quick Reply #1' }),
      )
      node.addOutput(
        `output_quickReply_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'Carousel Quick Reply #2' }),
      )
      node.addOutput(
        `output_quickReply_${crypto.randomUUID()}`,
        new CustomOutput({ socket, type: 'classic', label: 'Carousel Quick Reply #3' }),
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
    outputs: { [key: string]: Output<ClassicPreset.Socket> } | undefined
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

/////////////////////////
// Facebook Templates //
///////////////////////

export namespace FBAttachmentTemplate {
  export interface Attachment {
    attachment: {
      type: 'template'
      payload: {
        template_type: 'generic'
        elements: Element[]
      }
    }
  }

  export interface Element {
    title: string
    subtitle: string
    image_url: string
    buttons: Button[]
  }

  export interface Button {
    type: 'web_url' | 'postback'
    title: string
    url?: string // Optional because 'postback' type doesn't require it
    messenger_extensions?: boolean // Optional for web_url type
    payload?: string // Optional because 'web_url' doesn't need payload
  }
}

//////////////////////////
// Flow Data Templates //
////////////////////////

interface FlowData {
  flow_id: string
  flow_node_data: FlowNodeData[]
}

type FlowNodeData = {
  node_id: string
  postback_id: string
  message_type: string
  message_data: {
    text?: string
    attachment?: FBAttachmentTemplate.Attachment
    quick_replies?: {
      content_type: string
      title: string
      payload: string // This is the postback payload that will call another node ID
    }[]
  }
}

////////////////////
// CUSTOM OUTPUT //
//////////////////

type CustomOutputTypeOpts = {
  classic: {
    label?: string
  }
  reply: {
    question: string
    answer: string
  }
  card: {
    question: string
    answer: string
    image: string
  }
}

type OutputConstructorArgs = { socket: ClassicPreset.Socket } & (
  | ({ type: 'classic' } & CustomOutputTypeOpts['classic'])
  | ({ type: 'reply' } & CustomOutputTypeOpts['reply'])
  | ({ type: 'card' } & CustomOutputTypeOpts['card'])
)
export class CustomOutput extends ClassicPreset.Output<ClassicPreset.Socket> {
  data: any

  constructor(args: OutputConstructorArgs) {
    super(args.socket)

    if (args.type === 'reply') {
      const { question, answer } = args
      this.setData({ question, answer })
    } else if (args.type === 'card') {
      const { question, answer, image } = args
      this.setData({ question, answer, image })
    } else {
      this.label = args.label
    }
  }

  setData(data: any) {
    this.data = data
  }
}

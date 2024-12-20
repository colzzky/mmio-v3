import type { SubCollections } from '../types/UniTypes'
import { ClassicPreset, type GetSchemes } from 'rete'
import type { VueArea2D } from 'rete-vue-plugin'
import type { Input, Output } from 'rete/_types/presets/classic'
import type { FBAttachmentTemplate } from './flow-meta-types'

export interface NodeType {
  message_node: MessageNode
  text_node: MessageNode
  carousel_node: MessageNode
  reference_node: MessageNode
  button_node: ButtonNode
}

interface MessageNode {
  name: string
  message: string
  origin_return:{origin:string,postback:{
    target_node:string,
    target_output:string
  }}[]
}

interface ButtonNode {
  name: string
  message: string
  isClick: boolean
  origin_return:{origin:string,postback:{
    target_node:string,
    target_output:string
  }}[]
}

export class Node<T extends keyof NodeType> extends ClassicPreset.Node<
  Record<string, ClassicPreset.Socket>, // Inputs
  Record<string, ClassicPreset.Socket>, // Outputs
  Record<string, ControlInterface>      // Controls
> {
  data?: NodeType[T];          // Dynamically infer the type of 'data' based on 'T'
  label: T;

  constructor(label: T) {
    super(label); // Call the constructor of the base class (ClassicPreset.Node)
    this.label = label;
  }
}

export function isNodeOfType<T extends keyof NodeType>(
  node: Node<keyof NodeType>,
  label: T
): node is Node<T> {
  return node.label === label;
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

export type Schemes = GetSchemes<Node<keyof NodeType>, Connection<Node<keyof NodeType>>>;
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
      const node = new Node('message_node')
      node.id = crypto.randomUUID()
      node.addControl('input', control_template.text)
      node.addControl('input2', control_template.number)
      node.addControl('test', control_template.testControl)

      node.addOutput('socket', new ClassicPreset.Output(socket))
      node.addInput('socket', new ClassicPreset.Input(socket))
      node.addInput('socket2', new ClassicPreset.Input(socket))

      return node
    },
    reference_node(socket: ClassicPreset.Socket) {
      const node = new Node('reference_node')
      node.id = crypto.randomUUID()
      node.data={
        message:'',
        name:'',
        origin_return:[]
      }
      

      createMetaTemplateOutput({
        node,
        type: 'classic',
        outputOpts: {
          socket,
          data: {
            label: ''

          }
        },
      })
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
      node.data={
        message:'',
        name:'',
        origin_return:[]
      }
      node.id = crypto.randomUUID()
      node.addInput(`input_${crypto.randomUUID()}`, new ClassicPreset.Input(socket, 'hello', true))

      // replies
      createMetaTemplateOutput({
        node,
        type: 'reply',
        outputOpts: {
          socket,
          data: {
            title: 'Message Question #1',
            type: 'postback',
            payload:''
          }
        },
      })
      createMetaTemplateOutput({
        node,
        type: 'reply',
        outputOpts: {
          socket,
          data: {
            title: 'Message Question #2',
            type: 'postback',
            payload:''
          }
        },
      })

      // quick replies
      createMetaTemplateOutput({
        node,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: 'Message Quick Reply #1',
            content_type: "text"
          }

        },
      })
      createMetaTemplateOutput({
        node,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: 'Message Quick Reply #2',
            content_type: "text"

          }
        },
      })
      createMetaTemplateOutput({
        node,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: 'Message Quick Reply #3',
            content_type: "text"

          }
        },
      })

      return node
    },

    carousel_node(socket: ClassicPreset.Socket) {
      const node = new Node('carousel_node')
      node.id = crypto.randomUUID()
      node.addInput(`input_${crypto.randomUUID()}`, new ClassicPreset.Input(socket, 'hello', true))

      // cards

      createMetaTemplateOutput({
        node,
        type: 'carouselCard',
        outputOpts: {
          socket,
          data: {
            question: 'Carousel Question #1',
            answer: 'Carousel Answer #1',
            image: '',
          }
        },
      })
      createMetaTemplateOutput({
        node,
        type: 'carouselCard',
        outputOpts: {
          socket,
          data: {
            question: 'Carousel Question #2',
            answer: 'Carousel Answer #2',
            image: '',
          }
        },
      })

      // quick replies
      createMetaTemplateOutput({
        node,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: 'Carousel Quick Reply #1',
            content_type: 'text'
          }
        },
      })
      createMetaTemplateOutput({
        node,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: 'Carousel Quick Reply #2',
            content_type: 'text'

          }
        },
      })
      createMetaTemplateOutput({
        node,
        type: 'quickReply',
        outputOpts: {
          socket,
          data: {
            title: 'Carousel Quick Reply #3',
            content_type: 'text'

          }
        },
      })

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
    outputs: { [key: string]: MetaTemplateOutput<keyof MetaTemplateOutputType> } | undefined
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
////////////////////////

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

////////////////////
// CUSTOM OUTPUT //
//////////////////
/**
type MetaTemplateOutputType = {
  classic: ClassicOutput
  reply: ReplyOutput
  quickReply: CarouselCardOutput
  carouselCard: QuickReplyOutput
};

type ClassicOutput = {
  label?: string;
};
type ReplyOutput = {
  question: string;
  answer: string;
};
type CarouselCardOutput = {
  question: string;
  answer: string;
  image: string;
};
 */
//type QuickReplyOutput = FBAttachmentTemplate.QuickReply;
export type MetaTemplateOutputType = {
  classic: {
    label?: string;
  };
  reply: FBAttachmentTemplate.Button

  carouselCard: {
    question: string;
    answer: string;
    image: string;
  };
  quickReply: FBAttachmentTemplate.QuickReply
};

// Arguments passed into MetaTemplateOutput's constructor based on the type
type MetaTemplateOutputConstructorArgs<T extends keyof MetaTemplateOutputType> = {
  socket: ClassicPreset.Socket;
  key: string;
} & { data: MetaTemplateOutputType[T] };  // Dynamically adds fields based on the 'type' passed

type CreateMetaTemplateOutputArgs<T extends keyof MetaTemplateOutputType> = {
  node: Node<keyof NodeType>;
  type: T
  outputOpts: {
    socket: ClassicPreset.Socket
    data: MetaTemplateOutputType[T];
  }
};

// Factory function to create a MetaTemplateOutput dynamically based on type
export function createMetaTemplateOutput<T extends keyof MetaTemplateOutputType>(args: CreateMetaTemplateOutputArgs<T>, outKey:string='') {
  const outputKey = !outKey ? `output_${args.type}_${crypto.randomUUID()}` : outKey; // Create a unique key for the output
  args.node.addOutput(outputKey, new MetaTemplateOutput(args.type, { socket: args.outputOpts.socket, data: args.outputOpts.data, key: outputKey })); // Add the output to the node
  return {args, outputKey}; // Return the arguments and the output key
}

export class MetaTemplateOutput<T extends keyof MetaTemplateOutputType> extends ClassicPreset.Output<ClassicPreset.Socket> {
  data: MetaTemplateOutputType[T]; // Data will be of the correct type based on 'T'
  type: keyof MetaTemplateOutputType;
  id: string;

  constructor(typeT: T, args: MetaTemplateOutputConstructorArgs<T>) {
    super(args.socket); // Initialize with socket
    this.type = typeT;   // Set the type (e.g., 'reply', 'quickReply', etc.)
    this.id = args.key;  // Set the ID (provided as part of args)

    // Dynamically set the data based on the type
    this.data = { ...args.data };  // Assign the provided arguments to 'data'
  }
}


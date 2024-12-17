import { ClassicPreset, type GetSchemes } from "rete";
import type { VueArea2D } from "rete-vue-plugin";
import type { Input, Output } from "rete/_types/presets/classic";



export class Node extends ClassicPreset.Node<
    Record<string, ClassicPreset.Socket>,
    Record<string, ClassicPreset.Socket>,
    Record<string, ControlInterface>
> {
    data?: any; // Add the 'data' property directly as part of the class
}

export type ControlInterface = CustomControls.Test | ClassicPreset.InputControl<"number"> | ClassicPreset.InputControl<"text">
export namespace CustomControls {
    interface SampleInput {
        label: string,
        placeholder: string
    }
    export class Test extends ClassicPreset.Control {
        public type = 'testControl'
        public details: SampleInput;

        constructor(_details: SampleInput) {
            super();
            this.details = _details;
        }
    }

    //Add more custom control here
}

export class Connection<A extends Node> extends ClassicPreset.Connection<A, A> { }

export type Schemes = GetSchemes<Node, Connection<Node>>;
export type AreaExtra = VueArea2D<Schemes>;



/////////////////////
// RETE Templates //
///////////////////

//Rete Templates are pre determined nodes, control, input and outputs 
export namespace ReteTemplates {
    export const control_types = ['text', 'number', 'testControl'] as const
    export const control_template: Record<(typeof control_types)[number], ControlInterface> = {
        text: new ClassicPreset.InputControl("text", {
            initial: '',
            change(value) {
                console.log(value)
            },
        }),
        number: new ClassicPreset.InputControl("number", {
            initial: 0,
            change(value) {
            },
        }),
        testControl: new CustomControls.Test({
            label: "Hello World",
            placeholder: "Enter a valuess"
        })
    }
    //These are the templates needed to create a Facebook Node
    export const node_templates = {
        custom_node(socket: ClassicPreset.Socket) {
            const node = new Node("Custom")
            node.id = crypto.randomUUID()
            node.addControl('input', control_template.text)
            node.addControl('input2', control_template.number)
            node.addControl('test', control_template.testControl)

            node.data = {
                details: "Hello World",
                content: "Enter a This is a content",
            };
            node.addOutput("socket", new ClassicPreset.Output(socket));
            node.addInput("socket", new ClassicPreset.Input(socket));
            node.addInput("socket2", new ClassicPreset.Input(socket));

            return node
        },
        reference_node(socket: ClassicPreset.Socket) {
            const node = new Node("reference_node")
            node.id = crypto.randomUUID()
            node.addOutput("socket", new ClassicPreset.Output(socket));
            return node
        },
        text_node(socket: ClassicPreset.Socket) {
            const node = new Node("text_node")
            node.id = crypto.randomUUID()
            node.addOutput("socket", new ClassicPreset.Output(socket));
            node.addOutput("socket1", new ClassicPreset.Output(socket));
            return node
        }
    }
}

//Serialized State. This is the typ used when saving and populating rete editor
export namespace SerializedFlow {
    export interface Node {
        id: string;
        label: string;
        controls: { [key: string]: ControlInterface };
        outputs: { [key: string]: Output<ClassicPreset.Socket> } | undefined;
        inputs: { [key: string]: Input<ClassicPreset.Socket> } | undefined;
        position: { x: number; y: number };
        data: any;
    }

    export interface Connection {
        id: string
        source: string
        sourceOutput: string
        target: string
        targetInput: string
    }

    export interface State {
        nodes: Node[],
        connections: Connection[],
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
            type: "template";
            payload: {
                template_type: "generic";
                elements: Element[];
            };
        };
    }

    export interface Element {
        title: string;
        subtitle: string;
        image_url: string;
        buttons: Button[];
    }

    export interface Button {
        type: "web_url" | "postback";
        title: string;
        url?: string; // Optional because 'postback' type doesn't require it
        messenger_extensions?: boolean; // Optional for web_url type
        payload?: string; // Optional because 'web_url' doesn't need payload
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
        text?: string,
        attachment?: FBAttachmentTemplate.Attachment,
        quick_replies?: {
            content_type: string,
            title: string,
            payload: string// This is the postback payload that will call another node ID 
        }[]
    }
}






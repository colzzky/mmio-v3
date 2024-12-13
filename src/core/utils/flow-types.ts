import { ClassicPreset, type GetSchemes } from "rete";
import type { VueArea2D } from "rete-vue-plugin";

interface SampleInput {
    label: string,
    placeholder: string
}

export class TestControl extends ClassicPreset.Control {
    public type = 'TestControl'
    public details: SampleInput;

    constructor(_details: SampleInput) {
        super();
        this.details = _details;
    }
}

export class Node extends ClassicPreset.Node<
    Record<string, ClassicPreset.Socket>,
    Record<string, ClassicPreset.Socket>,
    Record<string, TestControl | ClassicPreset.InputControl<"number"> | ClassicPreset.InputControl<"text">>
> {
    data?: any; // Add the 'data' property directly as part of the class
}

export class Connection<A extends Node> extends ClassicPreset.Connection<A, A> { }

export type Schemes = GetSchemes<Node, Connection<Node>>;
export type AreaExtra = VueArea2D<Schemes>;

export const rete_node_templates = {
    custom_node(socket: ClassicPreset.Socket) {
        const node = new Node("Custom")
        node.id = crypto.randomUUID()
        node.addControl('input', new ClassicPreset.InputControl("text", {
            initial: '',
            change(value) {
                console.log(value)
            },
        }))
        node.addControl('input2', new ClassicPreset.InputControl("number", {
            initial: 0,
            change(value) {
            },
        }))
        node.addControl('test', new TestControl({
            label: "Hello World",
            placeholder: "Enter a valuess"
        }))

        node.data = {
            details: "Hello World",
            content: "Enter a This is a content",
        };

        node.addOutput("socket", new ClassicPreset.Output(socket));
        node.addInput("socket", new ClassicPreset.Input(socket));
        
        return node
    },
    reference_node(socket: ClassicPreset.Socket){
        const node = new Node("reference_node")
        node.id = crypto.randomUUID()
        node.addOutput("socket", new ClassicPreset.Output(socket));
        return node
    },
    text_node(socket: ClassicPreset.Socket){
        const node = new Node("text_node")
        node.id = crypto.randomUUID()
        node.addOutput("socket", new ClassicPreset.Output(socket));
        node.addOutput("socket1", new ClassicPreset.Output(socket));
        return node
    }
}
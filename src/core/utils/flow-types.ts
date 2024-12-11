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
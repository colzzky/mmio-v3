<script lang="ts" setup>
import { ref, onMounted, type Ref, reactive, watch } from "vue";
import { NodeEditor, type GetSchemes, ClassicPreset, type NodeId } from "rete";
import { AreaPlugin, AreaExtensions, NodeView } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { VuePlugin, Presets, type VueArea2D } from "rete-vue-plugin";

import { useAuthWorkspaceStore } from "@/stores/authWorkspaceStore";
import { TestControl, type AreaExtra, type Schemes, Node, Connection, rete_node_templates } from "@/core/utils/flow-types";
import CustomControl from "../rete/customControl.vue";
import Reference from "../rete/TemplateNode/reference.vue";
import Text from "../rete/TemplateNode/text.vue";
import CustomNode from "../rete/customNode.vue";
import { toast } from "@/core/components/ui/toast";

//** Pending: We need to create an interface when saving editor proceed at line saveEditorState and use it when we reload the state */

interface MousePosition {
    x: number
    y: number
}

const authWorkspace = useAuthWorkspaceStore()
const { active_flow } = authWorkspace

// Menu state
const menuVisible = ref(false);
const nodeOptionVisible = ref(false);
const menuPosition = ref<MousePosition>({ x: 0, y: 0 });
const mousePosition = ref<MousePosition>({ x: 0, y: 0 });
const reteContainer = ref<HTMLDivElement>();
const socket = new ClassicPreset.Socket("socket");

const selector = AreaExtensions.selector();
const accumulating = AreaExtensions.accumulateOnCtrl();
const selected_node = ref<NodeId>('')
const multi_selected_node = ref<NodeId[]>([])

let area = null as AreaPlugin<Schemes, AreaExtra> | null
const rete_init = reactive({
    editor: null as NodeEditor<Schemes> | null,
    render: null as VuePlugin<Schemes, AreaExtra> | null,
    connection: null as ConnectionPlugin<Schemes, AreaExtra> | null,
})

// Close the floating menu
function closeMenu() {
    menuVisible.value = false;
}
function closeNodeOption(reset_selected: boolean = true) {
    nodeOptionVisible.value = false;
    if (reset_selected) selected_node.value = ''
}

async function initializeFlow() {
    if (!reteContainer.value) return;

    // Initialize the Area and Rete
    area = new AreaPlugin<Schemes, AreaExtra>(reteContainer.value);
    rete_init.editor = new NodeEditor<Schemes>();
    rete_init.render = new VuePlugin<Schemes, AreaExtra>();
    rete_init.connection = new ConnectionPlugin<Schemes, AreaExtra>();
    rete_init.connection.addPreset(ConnectionPresets.classic.setup());

    // Use the customized preset
    rete_init.render.addPreset(
        Presets.classic.setup({
            customize: {
                node(context) {
                    if (context.payload.label === "Custom") {
                        return CustomNode;
                    }
                    if (context.payload.label === 'reference_node') {
                        return Reference
                    }
                    if (context.payload.label === 'text_node') {
                        return Text
                    }
                    return Presets.classic.Node;
                },
                control(context) {
                    if (context.payload instanceof TestControl) {
                        return CustomControl;
                    }
                    if (context.payload instanceof ClassicPreset.InputControl) {
                        return Presets.classic.Control;
                    }
                },
                socket() {
                    return Presets.classic.Socket;
                },
                connection() {
                    return Presets.classic.Connection;
                }
            }
        })
    );

    rete_init.editor.use(area);
    area.use(rete_init.connection);
    area.use(rete_init.render);

    if (active_flow.json) {
        //Reload saved flow if there is an existing state
        reloadEditorState()
    }

    AreaExtensions.selectableNodes(area, selector, { accumulating });
    trackMouseEvents(area);
}

const reloadEditorState = async () => {
    if (!active_flow.json || !area || !rete_init.editor) return;

    const parsedState = JSON.parse(active_flow.json);

    for (const nodeData of parsedState.nodes) {
        const node = new Node(nodeData.label); // Recreate node
        node.id = nodeData.id;
        nodeData.controls &&
            Object.keys(nodeData.controls).forEach((key) => {
                const control = nodeData.controls[key];
                if (control.type === 'TestControl') {
                    node.addControl('test', new TestControl(control.details))
                    return
                }
                else {
                    node.addControl(key, new ClassicPreset.InputControl(control.type, {
                        initial: control.value || 0,
                        change(value) {
                            console.log(value)
                        },
                    }));
                }

            });

        //Should be forloop depending on the saved socket
        console.log(nodeData.inputs)
        if (Object.keys(nodeData.inputs).length > 0) {
            Object.keys(nodeData.inputs).forEach((key) => {
                node.addInput(key, new ClassicPreset.Input(socket));
            })
        }

        if (Object.keys(nodeData.outputs).length > 0) {
            Object.keys(nodeData.outputs).forEach((key) => {
                node.addOutput(key, new ClassicPreset.Input(socket));
            })
        }


        // Add the node back to the editor
        await rete_init.editor.addNode(node);
        // Restore node position
        await area.translate(node.id, nodeData.position);
    }

    // Step 4: Rebuild connections
    for (const connData of parsedState.connections) {
        const sourceNode = rete_init.editor.getNode(connData.source);
        const targetNode = rete_init.editor.getNode(connData.target);
        if (sourceNode && targetNode) {
            await rete_init.editor.addConnection(
                new Connection(sourceNode, connData.sourceOutput, targetNode, connData.targetInput)
            );
        }
    }
};

function trackMouseInsideNode(details: {
    nodeHeight: number
    nodeWidth: number
    nodePosition: { x: number, y: number }
    mousePosition: { x: number, y: number }
}) {
    interface Position {
        x: number;
        y: number;
    }

    const nodePosition: Position = details.nodePosition;
    const mousePosition: Position = details.mousePosition;

    return mousePosition.x >= nodePosition.x &&
        mousePosition.x <= (nodePosition.x + details.nodeWidth) &&
        mousePosition.y >= nodePosition.y &&
        mousePosition.y <= (nodePosition.y + details.nodeHeight);
}

function isMouseOutsideNode(details: {
    nodeHeight: number;
    nodeWidth: number;
    nodePosition: { x: number; y: number };
    mousePosition: { x: number; y: number };
}): boolean {
    const { nodeHeight, nodeWidth, nodePosition, mousePosition } = details;

    return (
        mousePosition.x < nodePosition.x ||
        mousePosition.x > nodePosition.x + nodeWidth ||
        mousePosition.y < nodePosition.y ||
        mousePosition.y > nodePosition.y + nodeHeight
    );
}

// Track mouse events and handle right-click
function trackMouseEvents(area: AreaPlugin<Schemes, AreaExtra>) {
    area.addPipe((context) => {
        const mouse_inside_nodes: string[] = []

        if (context.type === 'zoom') {
            closeMenu()
            closeNodeOption(false)
        }

        if (context.type === "pointerdown" && context.data.event.button === 2 && rete_init.editor) {
            menuVisible.value = false;
            nodeOptionVisible.value = false;
            selected_node.value = '';

            menuPosition.value = {
                x: context.data.event.clientX,
                y: context.data.event.clientY
            }

            area.nodeViews.forEach((ar, key) => {
                const check_in_position = trackMouseInsideNode({
                    nodeHeight: ar.element.offsetHeight,
                    nodeWidth: ar.element.offsetWidth,
                    nodePosition: ar.position,
                    mousePosition: context.data.position
                })
                if (check_in_position) {
                    mouse_inside_nodes.push(key)
                }
            });

            if (!(mouse_inside_nodes.length > 0)) {
                menuVisible.value = true;
            }
        }

        if (context.type === "nodepicked") {
            menuVisible.value = false;
            nodeOptionVisible.value = false;
            selected_node.value = context.data.id
            multi_selected_node.value = [context.data.id]
        }

        if (context.type === "pointerup" && selected_node.value) {
            area.nodeViews.forEach((ar, node_key) => {
                if (node_key === selected_node.value) {
                    const mouse_outside = isMouseOutsideNode({
                        nodeHeight: ar.element.offsetHeight,
                        nodeWidth: ar.element.offsetWidth,
                        nodePosition: ar.position,
                        mousePosition: context.data.position
                    })
                    if (mouse_outside) {
                        closeNodeOption()
                    }
                }
            })
        }

        if (context.type === "pointerup" && multi_selected_node.value.length > 0) {
            const checker: boolean[] = []
            multi_selected_node.value.forEach(node => {
                const e_n = area.nodeViews.get(node)
                if (e_n) {

                    const mouse_outside = isMouseOutsideNode({
                        nodeHeight: e_n.element.offsetHeight,
                        nodeWidth: e_n.element.offsetWidth,
                        nodePosition: e_n.position,
                        mousePosition: context.data.position
                    })
                    checker.push(mouse_outside)
                }
            })
            if (!checker.includes(false)) {
                multi_selected_node.value = []
                closeNodeOption()
            }
        }

        if (context.type === "pointerup" && (context.data.event.button === 0 && (context.data.event.altKey)) && selected_node.value) {
            console.log(selected_node.value)
            menuPosition.value = {
                x: context.data.event.clientX,
                y: context.data.event.clientY
            }
            console.log(context.data.position)
            console.log(menuPosition.value)
            nodeOptionVisible.value = true;
        }

        return context;
    });

    // Hide the menu when clicking outside
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault()
    });

    document.addEventListener("click", (e) => {
        if (menuVisible.value) {
            const target = e.target as HTMLElement;
            if (!target.closest(".floating-menu")) {
                closeMenu();
            }
        }
    });

    document.addEventListener("pointerup", (e) => {
        if ((e.metaKey || e.ctrlKey)) {
            const multi_selected: string[] = []
            console.log('hey add multi')
            if (rete_init.editor && rete_init.editor.getNodes().length > 0) {
                rete_init.editor.getNodes().forEach(node => {
                    if (node.selected === true) {
                        multi_selected.push(node.id)
                    }
                })
            }
            if (multi_selected.length > 1) {
                closeNodeOption()
                closeMenu()
            }
            multi_selected_node.value = [...multi_selected]
            console.log(multi_selected_node.value)
            console.log(selected_node.value)
        }
    });
}

function getTranslatedMousePosition(event: MousePosition) {
    if (area) {

        const { transform } = area.area; // Rete.js area transform

        // Step 1: Get the mouse position relative to the Rete.js container
        const containerRect = area.container.getBoundingClientRect();
        const mouseX = event.x - containerRect.left;
        const mouseY = event.y - containerRect.top;

        // Step 2: Apply pan (transform.x/y) and zoom (transform.k)
        const actualX = (mouseX - transform.x) / transform.k;
        const actualY = (mouseY - transform.y) / transform.k;
        return { x: actualX, y: actualY };
    } else {
        return { x: 0, y: 0 };
    }
}

// Create a new node dynamically
async function createNewNode(node_type: 'custom_node' | 'reference_node' | 'text_node') {
    if (!area || !rete_init.editor || !reteContainer.value) return;
    let node = null as Node | null

    node = rete_node_templates[node_type](socket)

    if (node) {
        await rete_init.editor.addNode(node);
        await area.translate(node.id, getTranslatedMousePosition(menuPosition.value));
    }

    closeMenu();
}

// Save editor state as JSON
const saveEditorState = async () => {
    if (!rete_init.editor) return;
    const serializedNodes = rete_init.editor.getNodes().map((node) => {
        const position = area?.nodeViews.get(node.id)?.position; // Get node position
        return {
            id: node.id,
            label: node.label,
            controls: node.controls,
            outputs: node.outputs,
            inputs: node.inputs,
            position: position || { x: 0, y: 0 }, // Default position if missing
            data: node.data, // Any extra props you attached
        };
    });

    const serializedState = {
        nodes: serializedNodes,
        connections: rete_init.editor.getConnections().map((conn) => ({
            id: conn.id,
            source: conn.source,
            sourceOutput: conn.sourceOutput,
            target: conn.target,
            targetInput: conn.targetInput,
        })),
        signal: rete_init.editor.signal,
        name: rete_init.editor.name
    };

    const parse_serial = JSON.stringify(serializedState)
    console.log(rete_init.editor)
    active_flow.json = parse_serial
    toast({
        title: 'Flow saved',
        variant: 'success',
        duration: 2000,
    })

};


onMounted(async () => {
    await initializeFlow();
});

watch(() => rete_init.editor, async (init_new, init_old) => {
    if (init_new && init_new.getNodes().length > 0) {
        //Uncomment if you want a consisten save
        //await saveEditorState()
    }
}, { deep: true })

function removeNode(): void {
    if (selected_node.value && area && rete_init.editor) {
        const connections = rete_init.editor.getConnections()
        connections.forEach((conn) => {
            if (conn.source === selected_node.value || conn.target === selected_node.value) {
                rete_init.editor?.removeConnection(conn.id)
            }
        })
        console.log(selected_node.value)
        rete_init.editor?.removeNode(selected_node.value)

        closeNodeOption()
    }
}

</script>

<template>
    <div class="">
        <!-- Rete.js Canvas -->
        <div class="h-screen bg-pink-50">
            <div v-if="menuVisible" class="floating-menu"
                :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }">
                <div @click="createNewNode('reference_node')">➕ New Reference Node</div>
                <div @click="createNewNode('custom_node')">➕ Create Node</div>
                <div @click="createNewNode('text_node')">➕ Create Text Node</div>
                <div>{{ menuPosition }}</div>
                <div @click="closeMenu">❌ Close</div>
            </div>
            <div v-if="nodeOptionVisible" class="floating-menu"
                :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }">
                <div>Node Option</div>
                <div>{{ menuPosition }}</div>
                <div @click="removeNode()">❌ Remove</div>
                <div @click="closeNodeOption()">❌ Close</div>
            </div>


            <div id="no-right-click" ref="reteContainer" class="bg-dotted h-screen bg-gray-50"></div>
        </div>

        <div class="fixed top-0 left-0 right-0 flex justify-between p-4">
            <div class="font-bold">
                <div class="flex gap-4">
                    <button @click="saveEditorState">Save</button>
                    <span>{{ multi_selected_node.length > 0 ? `${multi_selected_node.length} selected` : '' }}</span>
                </div>
            </div>
            <div class="self-start">
                <div class="flex flex-col gap-4">
                    <span>Left Click - Show Menu Options</span>
                    <span>Alt + Right Click inside Node - Show Node Option</span>
                    <span>Cmd + Right Click - Select Multiple Nodes</span>
                </div>
            </div>
        </div>
        <!-- Floating Menu -->

    </div>
</template>

<style scoped>
.bg-dotted {
    background-image: radial-gradient(currentColor .5px, transparent .5px);
    background-size: 10px 10px;
    /* Adjust size of dots */
    color: #c5c5c5;
    /* Change dot color */
}

.floating-menu {
    position: absolute;
    user-select: none;
    background: white;
    border: 1px solid black;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    z-index: 1000;
    padding: 8px;
    min-width: 150px;
}

.floating-menu div {
    cursor: pointer;
    padding: 4px 8px;
    transition: background 0.2s;
}

.floating-menu div:hover {
    background: #f0f0f0;
}

.pause-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    /* Semi-transparent background */
    display: none;
    /* Initially hidden */
    z-index: 1000;
    /* Ensures it is above other content */
}
</style>
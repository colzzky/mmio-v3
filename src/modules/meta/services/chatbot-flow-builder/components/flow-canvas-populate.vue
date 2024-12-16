<template>
    <div>
        <!-- File upload input -->
        <input type="file" @change="handleFileUpload" accept=".json" />

        <!-- Rete.js Canvas -->
        <div ref="reteContainer" class="rete-container"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { NodeEditor, type GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin';

// Define Schemes
type Schemes = GetSchemes<
    ClassicPreset.Node,
    ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

type AreaExtra = VueArea2D<Schemes>;

// Refs
const reteContainer = ref<HTMLDivElement | null>(null);
const uploadedFile = ref<File | null>(null);
let editor: NodeEditor<Schemes>;

// Handle file upload
const handleFileUpload = (event: Event) => {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
        uploadedFile.value = fileInput.files[0];
        loadEditorState(); // Automatically load the state after selecting the file
    }
};

// Initialize editor when mounted
onMounted(async () => {
    if (!reteContainer.value) return;

    // Initialize Node Editor
    editor = new NodeEditor<Schemes>();

    // Initialize AreaPlugin for rendering
    const area = new AreaPlugin<Schemes, AreaExtra>(reteContainer.value);
    const render = new VuePlugin<Schemes, AreaExtra>();
    render.addPreset(Presets.classic.setup());
    area.use(render);
    editor.use(area);
});

// Load and parse the editor state from the uploaded file
// Function to load and parse the editor state from the uploaded file
const loadEditorState = async () => {
    if (!uploadedFile.value) {
        alert('Please upload a valid JSON file');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const json = JSON.parse(e.target?.result as string);
        if (!json || !json.nodes || !json.connections) {
            alert('Invalid file format');
            return;
        }

        // Reinitialize the editor
        editor = new NodeEditor<Schemes>();

        // Initialize AreaPlugin for rendering
        if (reteContainer.value) {
            const area = new AreaPlugin<Schemes, AreaExtra>(reteContainer.value);
            const render = new VuePlugin<Schemes, AreaExtra>();
            render.addPreset(Presets.classic.setup());
            area.use(render);
            editor.use(area);

            // Define socket
            const numberSocket = new ClassicPreset.Socket('number');

            // Add nodes from the uploaded state
            const nodeMap = new Map(); // To store nodes by their IDs for easier lookup
            for (const nodeData of json.nodes) {
                const node = new ClassicPreset.Node(nodeData.label);
                node.id = nodeData.id; // Ensure node has the correct ID
                // Add inputs and outputs
                Object.entries(nodeData.inputs).forEach(([key, input]) => {
                    node.addInput(key, new ClassicPreset.Input(numberSocket));
                });
                Object.entries(nodeData.outputs).forEach(([key, output]) => {
                    node.addOutput(key, new ClassicPreset.Output(numberSocket));
                });
                await editor.addNode(node);
                nodeMap.set(nodeData.id, node); // Store the node in the map
                await area.translate(node.id, { x: nodeData.x || 100, y: nodeData.y || 100 });
            }

            // Add connections from the uploaded state
            for (const connectionData of json.connections) {
                const sourceNode = nodeMap.get(connectionData.source); // Get node by ID
                const targetNode = nodeMap.get(connectionData.target); // Get node by ID
                const sourceOutput = connectionData.sourceOutput;
                const targetInput = connectionData.targetInput;

                if (sourceNode && targetNode && sourceOutput && targetInput) {
                    const sourceSocket = sourceNode.outputs[sourceOutput];
                    const targetSocket = targetNode.inputs[targetInput];

                    if (sourceSocket && targetSocket) {
                        // Create the connection with both the node and socket
                        const connection = new ClassicPreset.Connection(sourceNode, sourceOutput, targetNode, targetInput);
                        await editor.addConnection(connection);
                    } else {
                        console.warn(`Connection failed for ${sourceOutput} -> ${targetInput} because of missing sockets`);
                    }
                } else {
                    console.warn(`Invalid connection: ${connectionData.source} -> ${connectionData.target}`);
                }
            }

            alert('Editor state loaded!');
        }
    };
    reader.readAsText(uploadedFile.value);
};
</script>

<style scoped>
.rete-container {
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
    background-color: #fafafa;
    position: relative;
    margin-top: 20px;
}

input[type="file"] {
    margin-bottom: 10px;
}
</style>
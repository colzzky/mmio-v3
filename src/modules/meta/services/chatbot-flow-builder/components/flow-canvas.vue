<template>
  <div class="container mx-auto">
    <!-- Rete.js Canvas -->
    <div id="no-right-click" ref="reteContainer" class="rete-container"></div>

    <!-- Buttons -->
    <div class="flex gap-4">
      <button @click="saveEditorState">Save</button>
      <button @click="createNewNode">New Node</button>
      <button @click="reloadEditorState">Reload</button>
    </div>

    <!-- Floating Menu -->
    <div v-if="menuVisible" class="floating-menu" :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }">
      <div @click="createNewNode()">➕ Create Node</div>
      <div>{{ menuPosition }}</div>
      <div @click="closeMenu">❌ Close</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, type Ref, reactive, watch } from "vue";
import { NodeEditor, type GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { VuePlugin, Presets, type VueArea2D } from "rete-vue-plugin";

import CustomSocket from "../rete/customSocket.vue";
import CustomConnection from "../rete/customConnection.vue";
import { InputControl } from "rete/_types/presets/classic";
import { useAuthStore } from "@/stores/authStore";
import { useAuthWorkspaceStore } from "@/stores/authWorkspaceStore";
import { TestControl, type AreaExtra, type Schemes, Node, Connection } from "@/core/utils/flow-types";
import CustomControl from "../rete/customControl.vue";
import CustomNode from "../rete/customNode.vue";

const authWorkspace = useAuthWorkspaceStore()
const { active_flow } = authWorkspace


// Menu state
const menuVisible = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const reteContainer = ref<HTMLDivElement>();
const socket = new ClassicPreset.Socket("socket");

let area = null as AreaPlugin<Schemes, AreaExtra> | null
const rete_init = reactive({
  editor: null as NodeEditor<Schemes> | null,
  render: null as VuePlugin<Schemes, AreaExtra> | null,
  connection: null as ConnectionPlugin<Schemes, AreaExtra> | null,
})


// Initialize the canvas
async function initializeCanvas() {
  if (!reteContainer.value) return;
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

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  trackMouseEvents(area);

  /**
  // Add a Start Node
  const start = new Node("A");
  start.addOutput("start", new ClassicPreset.Output(socket));
  start.addInput("start", new ClassicPreset.Input(socket));
  await rete_init.editor.addNode(start);

  await area.translate(start.id, { x: 100, y: 200 });
  await AreaExtensions.zoomAt(area, rete_init.editor.getNodes());
   */
  // Track mouse events and right-click

}

// Track mouse events and handle right-click
function trackMouseEvents(area: AreaPlugin<Schemes, AreaExtra>) {
  area.addPipe((context) => {
    if (context.type === "pointerdown" && context.data.event.button === 2) {
      context.data.event.preventDefault(); // Prevent default context menu
      menuPosition.value = {
        x: context.data.event.clientX,
        y: context.data.event.clientY,
      };
      menuVisible.value = true;
    }
    return context;
  });

  // Hide the menu when clicking outside
  document.addEventListener("click", (e) => {
    if (menuVisible.value) {
      const target = e.target as HTMLElement;
      if (!target.closest(".floating-menu")) {
        closeMenu();
      }
    }
  });
}

// Create a new node dynamically
async function createNewNode() {
  if (!area || !rete_init.editor) return;

  const customNodeProps = {
    label: "Hello World",  // You can change this based on your UI logic
    placeholder: "Enter a valuess",  // You can change this as well
  };

  // Create the node
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

  const onDetailsChange = (newDetails: any) => {
    console.log('Details changed:', newDetails);
  };


  node.addControl('test', new TestControl(customNodeProps))
  node.data = customNodeProps;


  node.addOutput("socket", new ClassicPreset.Output(socket));
  node.addInput("socket", new ClassicPreset.Input(socket));



  await rete_init.editor.addNode(node);
  await area.translate(node.id, { x: menuPosition.value.x, y: menuPosition.value.y });
  await AreaExtensions.zoomAt(area, rete_init.editor.getNodes());

  closeMenu();
}


// Close the floating menu
function closeMenu() {
  menuVisible.value = false;
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
  console.log(serializedState)
  active_flow.json = parse_serial
};



const reloadEditorState = async () => {
  if (!active_flow.json) return;

  area?.destroy()

  if (!reteContainer.value) return;
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

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  trackMouseEvents(area);


  if (!rete_init.editor || !area) return;
  console.log(active_flow.json)

  // Step 2: Parse the saved state
  const parsedState = JSON.parse(active_flow.json);

  const socket = new ClassicPreset.Socket("socket"); // Define socket for connections

  // Step 3: Rebuild nodes
  for (const nodeData of parsedState.nodes) {
    console.log(nodeData.label)
    const node = new Node(nodeData.label); // Recreate node
    node.id = nodeData.id;
    nodeData.controls &&
      Object.keys(nodeData.controls).forEach((key) => {
        const control = nodeData.controls[key];
        console.log(control)
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

    // Add inputs/outputs
    node.addOutput("socket", new ClassicPreset.Output(socket));
    node.addInput("socket", new ClassicPreset.Input(socket));

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

  // Step 5: Zoom to fit all nodes
  await AreaExtensions.zoomAt(area, rete_init.editor.getNodes());

  console.log("Editor state reloaded!");
};


// Lifecycle hook
onMounted(async () => {
  await initializeCanvas();
  const noRightClickDiv = document.getElementById("no-right-click");
  if (noRightClickDiv) {
    noRightClickDiv.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }
});

watch(() => rete_init.editor, async (init_new, init_old) => {
  if (init_new) {
    await saveEditorState()
  }
},
  { deep: true })
</script>

<style scoped>
.rete-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  background-color: #fafafa;
  position: relative;
}

.floating-menu {
  position: absolute;
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
</style>

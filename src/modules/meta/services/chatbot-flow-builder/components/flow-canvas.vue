<template>
  <div class="container mx-auto">
    <!-- Rete.js Canvas -->
    <div id="no-right-click" ref="reteContainer" class="rete-container"></div>

    <!-- Buttons -->
    <button @click="saveEditorState">Save</button>
    <button @click="createNewNode">New Node</button>

    <!-- Floating Menu -->
    <div v-if="menuVisible" class="floating-menu" :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }">
      <div @click="createNewNode()">➕ Create Node</div>
      <div>{{ menuPosition }}</div>
      <div @click="closeMenu">❌ Close</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { NodeEditor, type GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin';

// Refs
const reteContainer = ref<HTMLDivElement>();

// Define Schemes
type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = VueArea2D<Schemes>;

let editor: NodeEditor<Schemes>;
let area: AreaPlugin<Schemes, AreaExtra> | null = null;
let render = new VuePlugin<Schemes, AreaExtra>();

// Menu state
const menuVisible = ref(false);
const menuPosition = ref({ x: 0, y: 0 });

// Initialize the canvas
async function initializeCanvas() {
  if (!reteContainer.value) return;

  editor = new NodeEditor<Schemes>();
  area = new AreaPlugin<Schemes, AreaExtra>(reteContainer.value);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();

  render.addPreset(Presets.classic.setup());
  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  // Add a Start Node
  const numberSocket = new ClassicPreset.Socket('number');
  const start = new ClassicPreset.Node('Start Node');
  start.addOutput('start', new ClassicPreset.Output(numberSocket));
  await editor.addNode(start);
  await area.translate(start.id, { x: 100, y: 200 });

  await AreaExtensions.zoomAt(area, editor.getNodes());

  // Track mouse events and right-click
  trackMouseEvents(area);
}

// Track mouse events and handle right-click
function trackMouseEvents(area: AreaPlugin<Schemes, AreaExtra>) {
  area.addPipe((context) => {
    if (context.type === 'pointerdown' && context.data.event.button === 2) {
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
  document.addEventListener('click', (e) => {
    if (menuVisible.value) {
      const target = e.target as HTMLElement;
      if (!target.closest('.floating-menu')) {
        closeMenu();
      }
    }
  });
}

// Create a new node dynamically
async function createNewNode() {
  if (!area) return;

  const numberSocket = new ClassicPreset.Socket('number');
  const node = new ClassicPreset.Node('New Node');
  node.addInput('input', new ClassicPreset.Input(numberSocket));
  node.addOutput('output', new ClassicPreset.Output(numberSocket));
  await editor.addNode(node);
  await area.translate(node.id, { x: menuPosition.value.x, y: menuPosition.value.y });
  await AreaExtensions.zoomAt(area, editor.getNodes());
  closeMenu();
}

// Close the floating menu
function closeMenu() {
  menuVisible.value = false;
}

// Save editor state as JSON
const saveEditorState = async () => {
  const json = JSON.parse(JSON.stringify(editor));
  console.log(json);
  alert('Editor state saved as JSON file!');
};

// Lifecycle hook
onMounted(async () => {
  await initializeCanvas();
  const noRightClickDiv = document.getElementById('no-right-click');
  if (noRightClickDiv) {
    noRightClickDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
});

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

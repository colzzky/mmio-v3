<template>
    <div>
      <!-- Rete.js Canvas -->
      <div ref="reteContainer" class="rete-container"></div>
  
      <!-- Save Button -->
      <button @click="saveEditorState">Save</button>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { NodeEditor, type GetSchemes, ClassicPreset } from 'rete';
  import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
  import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin';
  
  // Define Schemes
  type Schemes = GetSchemes<
    ClassicPreset.Node, // Node type
    ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node> // Connection type
  >;
  
  type AreaExtra = VueArea2D<Schemes>;
  
  // Refs
  const reteContainer = ref<HTMLDivElement | null>(null);
  let editor: NodeEditor<Schemes>;
  
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
  
    // Define sockets
    const numberSocket = new ClassicPreset.Socket('number');
  
    // Create Start Node
    const start = new ClassicPreset.Node('Start Node');
    start.addOutput('start', new ClassicPreset.Output(numberSocket));
    await editor.addNode(start);
    await area.translate(start.id, { x: 100, y: 200 }); // Position start node
  
    // Create End Nodes (more than one)
    const end1 = new ClassicPreset.Node('End 1 Node');
    end1.addInput('end1', new ClassicPreset.Input(numberSocket));
    await editor.addNode(end1);
    await area.translate(end1.id, { x: 400, y: 100 }); // Position end1 node
  
    const end2 = new ClassicPreset.Node('End 2 Node');
    end2.addInput('end2', new ClassicPreset.Input(numberSocket));
    await editor.addNode(end2);
    await area.translate(end2.id, { x: 400, y: 300 }); // Position end2 node
  
    const end3 = new ClassicPreset.Node('End 3 Node');
    end3.addInput('end3', new ClassicPreset.Input(numberSocket));
    await editor.addNode(end3);
    await area.translate(end3.id, { x: 400, y: 500 }); // Position end3 node
  
    // Create connections from "Start" node to multiple "End" nodes
    const connection1 = new ClassicPreset.Connection(start, 'start', end1, 'end1');
    const connection2 = new ClassicPreset.Connection(start, 'start', end2, 'end2');
    const connection3 = new ClassicPreset.Connection(start, 'start', end3, 'end3');
    await editor.addConnection(connection1);
    await editor.addConnection(connection2);
    await editor.addConnection(connection3);
  
    // Zoom to fit all nodes
    await AreaExtensions.zoomAt(area, editor.getNodes());
  });
  
  // Method to save the editor state as a JSON file
  const saveEditorState = async () => {
    const json = JSON.parse(JSON.stringify(editor)); // Get the JSON representation of the editor state
    console.log(json)
    const jsonString = JSON.stringify(json); // Convert to string
  
    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'editor_state.json'; // File name
  
    // Trigger the "Save As" dialog (letting the user choose the location)
    link.click();
  
    alert('Editor state saved as JSON file!');
  };
  </script>
  
  <style scoped>
  .rete-container {
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
    background-color: #fafafa;
    position: relative;
  }
  </style>
  
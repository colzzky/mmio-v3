<script lang="ts" setup>
import MessageSheet from '../rete/TemplateNode/message-sheet.vue'
import Message from '../rete/TemplateNode/message.vue'
import Reference from '../rete/TemplateNode/reference.vue'
import Sidebar from '../rete/TemplateNode/sidebar.vue'
import Text from '../rete/TemplateNode/text.vue'
import CustomConnection from '../rete/custom-connection.vue'
import CustomControl from '../rete/customControl.vue'
import CustomNode from '../rete/customNode.vue'
import { toast } from '@/core/components/ui/toast'
import {
  CustomControls,
  type AreaExtra,
  type Schemes,
  Node,
  Connection,
  type ControlInterface,
  type SerializedFlow,
  ReteTemplates,
  type NodeType,
  createMetaTemplateOutIn,
  MetaTemplateOutput,
  isNodeOfType,
} from '@/core/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { NodeEditor, type GetSchemes, ClassicPreset, type NodeId, Signal } from 'rete'
import { AreaPlugin, AreaExtensions, NodeView } from 'rete-area-plugin'
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin'
import { ContextMenuPlugin, Presets as ContextMenuPresets } from 'rete-context-menu-plugin'
import { VuePlugin, Presets, type VueArea2D } from 'rete-vue-plugin'
import type { Input, Output, Socket } from 'rete/_types/presets/classic'
import { ref, onMounted, type Ref, reactive, watch, useTemplateRef } from 'vue'
import Menu from './custom-contextmenu/index.vue'
import type { ContextMenuRenderContext } from './custom-contextmenu/types'

//** Pending: We need to create an interface when saving editor proceed at line saveEditorState and use it when we reload the state */

interface MousePosition {
  x: number
  y: number
}

const authWorkspace = useAuthWorkspaceStore()
const { active_flow } = authWorkspace

// Menu states
const menuVisible = ref(false)
const nodeOptionVisible = ref(false)
const menuPosition = ref<MousePosition>({ x: 0, y: 0 })
const mousePosition = ref<MousePosition>({ x: 0, y: 0 })
const reteContainer = ref<HTMLDivElement>()
const socket = new ClassicPreset.Socket('socket')

const selector = AreaExtensions.selector()
const accumulating = AreaExtensions.accumulateOnCtrl()
const selected_node = ref<NodeId>('')
const selected_node_obj = ref<Node<keyof NodeType> | null>(null)
const multi_selected_node = ref<NodeId[]>([])

let area = null as AreaPlugin<Schemes, AreaExtra> | null
const rete_init = reactive({
  editor: null as NodeEditor<Schemes> | null,
  render: null as VuePlugin<Schemes, AreaExtra> | null,
  connection: null as ConnectionPlugin<Schemes, AreaExtra> | null,
})

// Close the floating menu
function closeMenu() {
  menuVisible.value = false
}
function closeNodeOption(reset_selected: boolean = true) {
  nodeOptionVisible.value = false
  if (reset_selected) {
    const multi_index = multi_selected_node.value.indexOf(selected_node.value)
    if (multi_index > -1) {
      multi_selected_node.value.splice(multi_index, 1)
    }
    selected_node.value = ''
  }
}

async function initializeFlow() {
  if (!reteContainer.value) return

  // Initialize the Area and Rete
  area = new AreaPlugin<Schemes, AreaExtra>(reteContainer.value)
  rete_init.editor = new NodeEditor<Schemes>()
  rete_init.render = new VuePlugin<Schemes, AreaExtra>()
  rete_init.connection = new ConnectionPlugin<Schemes, AreaExtra>()
  rete_init.connection.addPreset(ConnectionPresets.classic.setup())

  const socketTest = new ClassicPreset.Socket("socket")
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ["Reference", () => ReteTemplates.node_templates.reference_node()],
      ["Text", () => ReteTemplates.node_templates.message_node()],
      ["Carousel", () => ReteTemplates.node_templates.carousel_node()],
    ]),
  })

  /* @ts-ignore */
  area.use(contextMenu)

  // Use the customized preset
  rete_init.render.addPreset(
    Presets.classic.setup({
      customize: {
        node(context) {
          if (context.payload.label === 'reference_node') {
            return Reference
          }
          // if (context.payload.label === 'text_node') {
          //   return Text
          // }
          if (context.payload.label === 'message_node') {
            return Message
          }
          return Presets.classic.Node
        },
        control(context) {
          if (context.payload instanceof CustomControls.Test) {
            return CustomControl
          }
          if (context.payload instanceof ClassicPreset.InputControl) {
            return Presets.classic.Control
          }
        },
        connection() {
          return CustomConnection
        },
      },
    }),
  )

  rete_init.render.addPreset({
    update: function update(context: ContextMenuRenderContext) {
      console.log({ update: context })
      const delay = typeof (context.data === null || context.data === void 0 ? void 0 : context.data.delay) === 'undefined' ? 200 : context.data.delay;
      if (context.data.type === 'contextmenu') {
        return {
          items: context.data.items,
          delay: delay,
          searchBar: context.data.searchBar,
          onHide: context.data.onHide,
        }
      }
    },
    render: function render(context: ContextMenuRenderContext) {
      const delay = typeof (context.data === null || context.data === void 0 ? void 0 : context.data.delay) === 'undefined' ? 200 : context.data.delay;
      console.log({ render: context })
      if (context.data.type === 'contextmenu') {
        return {
          component: Menu,
          props: {
            items: context.data.items,
            delay: delay,
            searchBar: context.data.searchBar,
            onHide: context.data.onHide,
          },
        }
      }
    },
  })

  rete_init.editor.use(area)
  area.use(rete_init.connection)
  area.use(rete_init.render)

  if (active_flow.json) {
    //Reload saved flow if there is an existing state
    reloadEditorState()
  }

  AreaExtensions.selectableNodes(area, selector, { accumulating })
  trackMouseEvents(area)

}

const reloadEditorState = async () => {
  if (!active_flow.json || !area || !rete_init.editor) return

  const parsedState: SerializedFlow.State = JSON.parse(active_flow.json)
  console.log(parsedState)

  for (const nodeData of parsedState.nodes) {
    const node = new Node(nodeData.label as keyof NodeType) // Recreate node
    node.id = nodeData.id
    node.data = nodeData.data
    Object.keys(nodeData.controls).forEach((key) => {
      const control = nodeData.controls[key]
      if (control.type === 'text' || control.type === 'number') {
        node.addControl(key, ReteTemplates.control_template[control.type])
      } else {
        if (control.type === 'testControl')
          node.addControl(key, ReteTemplates.control_template.testControl)
        //Add more here
      }
    })

    //Should be forloop depending on the saved socket
    // if (nodeData.inputs && Object.keys(nodeData.inputs).length > 0) {
    //   Object.keys(nodeData.inputs).forEach((key) => {
    //     node.addInput(key, new ClassicPreset.Input(socket))
    //   })
    // }
    // if (nodeData.outputs && Object.keys(nodeData.outputs).length > 0) {
    //   const output = nodeData.outputs
    //   Object.keys(nodeData.outputs).forEach((key) => {
    //     createMetaTemplateOutput(
    //       {
    //         node,
    //         type: output[key].type,
    //         outputOpts: {
    //           socket,
    //           data: output[key].data,
    //         },
    //       },
    //       key,
    //     )
    //   })
    // }

    // Add the node back to the editor
    await rete_init.editor.addNode(node)
    // Restore node position
    await area.translate(node.id, nodeData.position)
  }

  // Step 4: Rebuild connections
  for (const connData of parsedState.connections) {
    console.log(connData)
    const sourceNode = rete_init.editor.getNode(connData.source)
    const targetNode = rete_init.editor.getNode(connData.target)
    if (sourceNode && targetNode) {
      await rete_init.editor.addConnection(
        new Connection(sourceNode, connData.sourceOutput, targetNode, connData.targetInput),
      )
    }
  }
}

function trackMouseInsideNode(details: {
  nodeHeight: number
  nodeWidth: number
  nodePosition: { x: number; y: number }
  mousePosition: { x: number; y: number }
}) {
  interface Position {
    x: number
    y: number
  }

  const nodePosition: Position = details.nodePosition
  const mousePosition: Position = details.mousePosition

  return (
    mousePosition.x >= nodePosition.x &&
    mousePosition.x <= nodePosition.x + details.nodeWidth &&
    mousePosition.y >= nodePosition.y &&
    mousePosition.y <= nodePosition.y + details.nodeHeight
  )
}

function isMouseOutsideNode(details: {
  nodeHeight: number
  nodeWidth: number
  nodePosition: { x: number; y: number }
  mousePosition: { x: number; y: number }
}): boolean {
  const { nodeHeight, nodeWidth, nodePosition, mousePosition } = details

  return (
    mousePosition.x < nodePosition.x ||
    mousePosition.x > nodePosition.x + nodeWidth ||
    mousePosition.y < nodePosition.y ||
    mousePosition.y > nodePosition.y + nodeHeight
  )
}

// Track mouse events and handle right-click
function trackMouseEvents(area: AreaPlugin<Schemes, AreaExtra>) {
  area.addPipe((context) => {
    const mouse_inside_nodes: string[] = []

    if (context.type === 'connectioncreate') {
      const check = checkConnectionSocket(context.data)
      if (check) {
        toast({
          title: 'Copatible',
          variant: 'success',
          duration: 2000,
        })
      } else {
        toast({
          title: 'Not Copatible',
          variant: 'destructive',
          duration: 2000,
        })
        return
      }

      if (rete_init.editor) {
        const soure_node = rete_init.editor.getNode(context.data.source)
        if (soure_node && soure_node.data) {
          const origin = soure_node.data.giver_data[context.data.sourceOutput]

          if (!origin) {
            toast({
              title: 'Something went wrong',
              variant: 'destructive',
              duration: 2000,
            })
            return
          } else {
            const target_node = rete_init.editor.getNode(context.data.target)
            if (target_node && target_node.data) {
              target_node.data.postbackid = soure_node.data.giver_data[context.data.sourceOutput]
            } else {
              toast({
                title: 'Something went wrong',
                variant: 'destructive',
                duration: 2000,
              })
              return
            }
          }
          // if (isNodeOfType(soure_node, 'message_node')) {
          //   //do something here
          // }
        }
      }
    }

    if (context.type === 'zoom') {
      closeMenu()
      closeNodeOption(false)
    }

    if (context.type === 'pointerdown' && context.data.event.button === 2 && rete_init.editor) {
      menuVisible.value = false
      nodeOptionVisible.value = false
      selected_node.value = ''

      menuPosition.value = {
        x: context.data.event.clientX,
        y: context.data.event.clientY,
      }

      area.nodeViews.forEach((ar, key) => {
        const check_in_position = trackMouseInsideNode({
          nodeHeight: ar.element.offsetHeight,
          nodeWidth: ar.element.offsetWidth,
          nodePosition: ar.position,
          mousePosition: context.data.position,
        })
        if (check_in_position) {
          mouse_inside_nodes.push(key)
        }
      })

      if (!(mouse_inside_nodes.length > 0)) {
        menuVisible.value = true
      }
    }

    if (context.type === 'nodepicked') {
      menuVisible.value = false
      nodeOptionVisible.value = false
      selected_node.value = context.data.id
      multi_selected_node.value = [context.data.id]
      console.log('select')
    }

    if (context.type === 'pointerup' && selected_node.value) {
      area.nodeViews.forEach((ar, node_key) => {
        if (node_key === selected_node.value) {
          const mouse_outside = isMouseOutsideNode({
            nodeHeight: ar.element.offsetHeight,
            nodeWidth: ar.element.offsetWidth,
            nodePosition: ar.position,
            mousePosition: context.data.position,
          })
          if (mouse_outside) {
            console.log('after  select')
            const node = rete_init.editor?.getNode(selected_node.value)
            if (node?.selected) {
              closeNodeOption(false)
            } else {
              closeNodeOption()
            }
          }
        }
      })
    }

    if (context.type === 'pointerup' && multi_selected_node.value.length > 1) {
      const checker: boolean[] = []
      multi_selected_node.value.forEach((node) => {
        const e_n = area.nodeViews.get(node)
        if (e_n) {
          const mouse_outside = isMouseOutsideNode({
            nodeHeight: e_n.element.offsetHeight,
            nodeWidth: e_n.element.offsetWidth,
            nodePosition: e_n.position,
            mousePosition: context.data.position,
          })
          checker.push(mouse_outside)
        }
      })
      if (!checker.includes(false)) {
        multi_selected_node.value = []
        closeNodeOption(false)
      }
    }

    if (
      context.type === 'pointerup' &&
      context.data.event.button === 0 &&
      context.data.event.altKey &&
      selected_node.value
    ) {
      console.log(selected_node.value)
      menuPosition.value = {
        x: context.data.event.clientX,
        y: context.data.event.clientY,
      }
      console.log(context.data.position)
      console.log(menuPosition.value)
      nodeOptionVisible.value = true
    }

    return context
  })

  document.addEventListener('click', (e) => {
    if (menuVisible.value) {
      const target = e.target as HTMLElement
      if (!target.closest('.floating-menu')) {
        closeMenu()
      }
    }
  })

  document.addEventListener('pointerup', (e) => {
    if (e.metaKey || e.ctrlKey) {
      const multi_selected: string[] = []
      console.log('hey add multi')
      if (rete_init.editor && rete_init.editor.getNodes().length > 0) {
        rete_init.editor.getNodes().forEach((node) => {
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
  })
}

function checkConnectionSocket(data: { source: string, sourceOutput: string, target: string, targetInput: string }) {
  if (rete_init.editor) {
    const source_node = rete_init.editor.getNode(data.source)
    const target_node = rete_init.editor.getNode(data.target)

    if (source_node && target_node) {
      const output_socket = source_node.outputs[data.sourceOutput]
      const Input_socket = target_node.inputs[data.targetInput]
      console.log(output_socket, Input_socket)
      if (output_socket && Input_socket) {
        return output_socket.socket.isCompatibleWith(Input_socket.socket)
      }
    }
  }
  return false
}


function getTranslatedMousePosition(event: MousePosition) {
  if (area) {
    const { transform } = area.area // Rete.js area transform

    // Step 1: Get the mouse position relative to the Rete.js container
    const containerRect = area.container.getBoundingClientRect()
    const mouseX = event.x - containerRect.left
    const mouseY = event.y - containerRect.top

    // Step 2: Apply pan (transform.x/y) and zoom (transform.k)
    const actualX = (mouseX - transform.x) / transform.k
    const actualY = (mouseY - transform.y) / transform.k
    return { x: actualX, y: actualY }
  } else {
    return { x: 0, y: 0 }
  }
}

// Save editor state as JSON
const saveEditorState = async () => {
  if (!rete_init.editor) return
  const serializedNodes: SerializedFlow.Node[] = rete_init.editor.getNodes().map((node) => {
    const position = area?.nodeViews.get(node.id)?.position // Get node position
    return {
      id: node.id,
      label: node.label,
      controls: node.controls as { [key: string]: ControlInterface },
      outputs: node.outputs as
        | { [key: string]: MetaTemplateOutput }
        | undefined,
      inputs: node.inputs as { [key: string]: Input<ClassicPreset.Socket> } | undefined,
      position: position || { x: 0, y: 0 },
      data: node.data, // Any extra props you attached
    }
  })

  const serializedState: SerializedFlow.State = {
    nodes: serializedNodes,
    connections: rete_init.editor.getConnections().map((conn) => ({
      id: conn.id as string,
      source: conn.source as string,
      sourceOutput: conn.sourceOutput as string,
      target: conn.target as string,
      targetInput: conn.targetInput as string,
    })),
    signal: rete_init.editor.signal as any,
    name: rete_init.editor.name as string,
  }

  const parse_serial = JSON.stringify(serializedState)
  //Print the serialized node and save to firestore
  console.log(rete_init.editor)

  //Save The Flow to json
  active_flow.json = parse_serial

  //Create a new Output data of the node
  toast({
    title: 'Flow saved',
    variant: 'success',
    duration: 2000,
  })
}

onMounted(async () => {
  await initializeFlow()
})

watch(
  () => rete_init.editor,
  async (init_new, init_old) => {
    if (init_new && init_new.getNodes().length > 0) {
      //console.log(rete_init.editor)
      //await saveEditorState()
    }
  },
  { deep: true },
)

watch(
  () => selected_node.value,
  async (new_node, old_node) => {
    if (new_node && rete_init.editor) {
      const node = rete_init.editor.getNode(new_node)
      console.log(node)
      if (node) {
        selected_node_obj.value = node
      }
    }
  },
)

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

function handleClearEditor() {
  rete_init.editor?.clear()
  closeMenu()
}
</script>

<template>
  <div class="">
    <!-- Rete.js Canvas -->
    <div class="h-screen bg-pink-50">
      <div v-if="nodeOptionVisible" class="floating-menu"
        :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }">
        <div>Node Option</div>
        <div>{{ menuPosition }}</div>
        <div @click="removeNode()">❌ Remove</div>
        <div @click="closeNodeOption()">❌ Close</div>
      </div>
      <div id="no-right-click" ref="reteContainer" class="bg-dotted h-screen bg-gray-50"></div>
    </div>

    <div class="absolute top-0 flex justify-between p-4">
      <div class="space-y-2">
        <div class="flex gap-4">
          <button class="font-bold" @click="saveEditorState">Save</button>
          <span>{{
            multi_selected_node.length > 0 ? `${multi_selected_node.length} selected` : ''
          }}</span>
        </div>
        <div>
          <div class="flex flex-col gap-4">
            <span>Left Click - Show Menu Options</span>
            <span>Alt + Right Click inside Node - Show Node Option</span>
            <span>Cmd + Right Click - Select Multiple Nodes</span>
          </div>
        </div>
      </div>
      <div
        class="fixed right-4 flex max-h-[80vh] min-w-2 max-w-[20%] flex-col overflow-auto rounded-lg border border-gray-300 bg-gray-100 p-3">
        <div v-if="selected_node && selected_node_obj && area">
          <div v-if="selected_node_obj.label === 'message_node'">
            <Sidebar :node="selected_node_obj" :node_id="selected_node_obj.id" :area />
          </div>
        </div>
        <div v-else>Selection bar</div>
      </div>
    </div>

    <!-- Floating Menu -->
  </div>
</template>

<style scoped>
.bg-dotted {
  background-image: radial-gradient(currentColor 0.5px, transparent 0.5px);
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

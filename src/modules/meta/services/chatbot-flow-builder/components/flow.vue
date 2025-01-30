<script lang="ts" setup>
import { context } from 'node_modules/radix-vue/dist/DismissableLayer/DismissableLayer'
import Audio from '../rete/TemplateNode/audio.vue'
import Carousel from '../rete/TemplateNode/carousel.vue'
import Condition from '../rete/TemplateNode/condition.vue'
import Generic from '../rete/TemplateNode/generic.vue'
import Image from '../rete/TemplateNode/image.vue'
import Media from '../rete/TemplateNode/media.vue'
import Message from '../rete/TemplateNode/message.vue'
import Reference from '../rete/TemplateNode/reference.vue'
import Trigger from '../rete/TemplateNode/trigger.vue'
import CustomConnection from '../rete/custom-connection.vue'
import CustomControl from '../rete/customControl.vue'
import NodeSheet from '../rete/sheets/node-sheet.vue'
import ActionBar from './action-bar.vue'
import Menu from './custom-contextmenu/index.vue'
import type { ContextMenuRenderContext } from './custom-contextmenu/types'
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
  MetaTemplateOutput,
  nodeMapContextMenu,
} from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { NodeEditor, ClassicPreset, type NodeId } from 'rete'
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin'
import { ConnectionPlugin, Presets as ConnectionPresets, canMakeConnection } from 'rete-connection-plugin'
import { ContextMenuPlugin, Presets as ContextMenuPresets } from 'rete-context-menu-plugin'
import { ReadonlyPlugin } from "rete-readonly-plugin";
import { VuePlugin, Presets } from 'rete-vue-plugin'
import type { Input } from 'rete/_types/presets/classic'
import { ref, onMounted, watch } from 'vue'

//** Pending: We need to create an interface when saving editor proceed at line saveEditorState and use it when we reload the state */

interface MousePosition {
  x: number
  y: number
}

const authWorkspace = useAuthWorkspaceStore()
const { active_flow } = authWorkspace
const { rete_init } = active_flow
const { draggable } = rete_init


// Menu states
const menuVisible = ref(false)
const nodeOptionVisible = ref(false)
const reteContainer = ref<HTMLDivElement>()
const editor_load = ref<boolean>(true)

const selector = AreaExtensions.selector()
const accumulating = AreaExtensions.accumulateOnCtrl()
const selected_node = ref<NodeId>('')
const selected_node_obj = ref<Node<keyof NodeType> | null>(null)
const multi_selected_node = ref<NodeId[]>([])

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
  editor_load.value = true
  if (!reteContainer.value) return

  // Initialize the Area and Rete
  rete_init.area = new AreaPlugin<Schemes, AreaExtra>(reteContainer.value)
  rete_init.editor = new NodeEditor<Schemes>()
  rete_init.render = new VuePlugin<Schemes, AreaExtra>()
  rete_init.connection = new ConnectionPlugin<Schemes, AreaExtra>()
  rete_init.connection.addPreset(ConnectionPresets.classic.setup())

  if (!rete_init.area) return

  //Doesnt follow anything
  rete_init.contextMenu = new ContextMenuPlugin<Schemes>({
    items(context: "root" | Schemes["Node"], plugin: ContextMenuPlugin<Schemes>) {
      if (context === 'root') {
        return {
          searchBar: true,
          list: Object.values(nodeMapContextMenu).map(({ label, key, template }) => ({
            label,
            key,
            handler: async () => {
              const node = ReteTemplates.node_templates[template]();
              if (rete_init.editor) {
                await rete_init.editor.addNode(node);
                await rete_init.contextMenu?.signal.emit('hide')
              }
            }
          }))
        }
      } else {
        console.log(context)
        //On delete/clone add something here
      }
      return {
        searchBar: false,
        list: [],
      }
    }
  })

  //Follows mouse
  // rete_init.contextMenu = new ContextMenuPlugin<Schemes>({
  //   items: ContextMenuPresets.classic.setup([
  //     ['Reference', () => {ReteTemplates.node_templates.reference_node()}],
  //     ['Message', () => ReteTemplates.node_templates.message_node()],
  //     ['Generic', () => ReteTemplates.node_templates.generic_node()],
  //     ['Carousel', () => ReteTemplates.node_templates.carousel_node()],
  //     ['Media', () => ReteTemplates.node_templates.media_node()],
  //     ['Image', () => ReteTemplates.node_templates.image_node()],
  //     ['Audio', () => ReteTemplates.node_templates.audio_node()],
  //     ['Trigger', () => ReteTemplates.node_templates.trigger_node()],
  //     ['Condition', () => ReteTemplates.node_templates.condition_node()],
  //   ]),
  // })


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
          if (context.payload.label === 'carousel_node') {
            return Carousel
          }
          if (context.payload.label === 'generic_node') {
            return Generic
          }
          if (context.payload.label === 'media_node') {
            return Media
          }
          if (context.payload.label === 'image_node') {
            return Image
          }
          if (context.payload.label === 'audio_node') {
            return Audio
          }
          if (context.payload.label === 'trigger_node') {
            return Trigger
          }
          if (context.payload.label === 'condition_node') {
            return Condition
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
    })
  )

  rete_init.render.addPreset({
    update: function update(context: ContextMenuRenderContext) {
      console.log({ update: context })
      const delay =
        typeof (context.data === null || context.data === void 0 ? void 0 : context.data.delay) ===
          'undefined'
          ? 200
          : context.data.delay
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
      const delay =
        typeof (context.data === null || context.data === void 0 ? void 0 : context.data.delay) ===
          'undefined'
          ? 200
          : context.data.delay
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
  rete_init.editor.use(rete_init.area)
  rete_init.editor.use(rete_init.readonly.root);
  rete_init.area.use(rete_init.connection)
  rete_init.area.use(rete_init.readonly.area);
  rete_init.area.use(rete_init.render)
  rete_init.area.use(rete_init.contextMenu)


  if (active_flow.json) {
    //Reload saved flow if there is an existing state
    //reloadEditorState()
  }

  AreaExtensions.selectableNodes(rete_init.area, selector, { accumulating })
  trackMouseEvents()

  addCustomBackground()
  editor_load.value = false

  console.log(editor_load.value)
}

const reloadEditorState = async () => {
  if (!active_flow.json || !rete_init.area || !rete_init.editor) return

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
    await rete_init.area.translate(node.id, nodeData.position)
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
function trackMouseEvents() {
  const area = rete_init.area
  const render = rete_init.render
  const editor = rete_init.editor
  const contextMenu = rete_init.contextMenu
  const connection = rete_init.connection
  let context_menu_position = { x: 0, y: 0 }
  let client_position = { x: 0, y: 0 }

  const isNodeRemoved = ref(false)
  if (area) {
    area.addPipe(async (context) => {

      if (context.type === 'pointermove'){
        if(rete_init.ui.connection_drop){
          client_position = {x:context.data.event.clientX, y:context.data.event.clientY}
        }
      }

      if (context.type === 'connectionremove') {
        isNodeRemoved.value = true
        if (rete_init.editor) {
          const soure_node = rete_init.editor.getNode(context.data.source)
          if (soure_node && soure_node.data) {
            const origin = soure_node.data.giver_data[context.data.sourceOutput]
            console.log(soure_node.data)
            console.log(context.data)
            console.log(soure_node)

            const target_node = rete_init.editor.getNode(context.data.target)
            if (target_node && target_node.data) {
              if (target_node.data.postbackid) {
                delete target_node.data['postbackid']
              }
            } else {
              toast({
                title: 'Something went wrong here',
                variant: 'destructive',
                duration: 2000,
              })
              return
            }

            // if (!origin) {
            //   toast({
            //     title: 'Something went wrong',
            //     variant: 'destructive',
            //     duration: 2000,
            //   })
            //   return
            // } else {

            // }
          }
        }
      }

      if (context.type === 'connectioncreate') {
        const check = checkConnectionSocket(context.data)
        console.log(context.data)
        if (check) {
          toast({
            title: 'Compatible',
            variant: 'success',
            duration: 2000,
          })
        } else {
          toast({
            title: 'Not Compatible',
            variant: 'destructive',
            duration: 2000,
          })
          return
        }

        if (rete_init.editor) {
          const soure_node = rete_init.editor.getNode(context.data.source)
          if (soure_node && soure_node.data) {
            const target_node = rete_init.editor.getNode(context.data.target)
            if (target_node && target_node.data) {
              if (
                !target_node.data.postbackid &&
                soure_node.data.giver_data[context.data.sourceOutput]
              ) {
                target_node.data.postbackid = soure_node.data.giver_data[context.data.sourceOutput]
              }
            } else {
              toast({
                title: 'Something went wrong here',
                variant: 'destructive',
                duration: 2000,
              })
              return
            }
            // if (isNodeOfType(soure_node, 'message_node')) {
            //   //do something here
            // }
          }
        }
      }

      if (context.type === 'nodetranslated') {
        //await rete_init.area.translate(context.data.id, context_menu_position);
        console.log(context.data)

      }

      if (context.type === 'nodecreated') {
        if (rete_init.editor && rete_init.ui.connection_drop) {
          console.log(rete_init.ui.connection_drop)
          const sourceNode = rete_init.editor.getNode(rete_init.ui.connection_drop.nodeId)
          const targetNode = context.data
          if (sourceNode && targetNode) {
            await rete_init.editor.addConnection(
              new Connection(sourceNode, rete_init.ui.connection_drop.key, targetNode, 'num'),
            )
          }
          rete_init.ui.connection_drop = null
        }

        if (rete_init.area) {
          console.log('test')
          await rete_init.area.translate(context.data.id, getTranslatedMousePosition(context_menu_position));
        }
      }

      if (context.type === 'nodepicked') {
        menuVisible.value = false
        nodeOptionVisible.value = false
        selected_node.value = context.data.id
        multi_selected_node.value = [context.data.id]
        rete_init.node_select(context.data.id)
      }

      if (context.type === 'pointerdown') {

        if (rete_init.selected_node) {
          rete_init.remove_selected_node()
        }
        if (rete_init.ui.connection_drop) {
          rete_init.ui.connection_drop = null
        }
        if (draggable.visibility === true) {
          console.log('test')
          draggable.visibility = false
          if (draggable.node && rete_init.editor && rete_init.area) {
            await rete_init.editor.addNode(draggable.node);

            await rete_init.area.translate(draggable.node.id, getTranslatedMousePosition(context.data.event));
          }
          draggable.node = null
          draggable.position = { x: 0, y: 0 }
        }
      }

      if (context.type === 'pointermove') {
        if (draggable.visibility === true) {
          draggable.updatePosition(context.data.event)
        }
      }

      if (context.type === 'contextmenu') {
        context_menu_position = {
          x: context.data.event.clientX,
          y: context.data.event.clientY
        }
        console.log(context_menu_position)
      }

      // if (context.type === 'pointerup' && multi_selected_node.value.length > 1) {
      //   const checker: boolean[] = []
      //   multi_selected_node.value.forEach((node) => {
      //     const e_n = area.nodeViews.get(node)
      //     if (e_n) {
      //       const mouse_outside = isMouseOutsideNode({
      //         nodeHeight: e_n.element.offsetHeight,
      //         nodeWidth: e_n.element.offsetWidth,
      //         nodePosition: e_n.position,
      //         mousePosition: context.data.position,
      //       })
      //       checker.push(mouse_outside)
      //     }
      //   })
      //   if (!checker.includes(false)) {
      //     multi_selected_node.value = []
      //     closeNodeOption(false)
      //   }
      // }
      return context
    })
  }

  if (connection) {
    connection.addPipe(async (context) => {
      if (context.type === 'connectionpick') {
        rete_init.ui.connection_drop = context.data.socket
      }

      if (context.type === 'connectiondrop') {
        if (!context.data.created && rete_init.area && !isNodeRemoved.value) {
          const event = new PointerEvent('contextmenu', {
            clientX: client_position.x,  // Adjust X relative to container
            clientY: client_position.y,   // Adjust Y relative to container
          })
          console.log(event)

          rete_init.ui.connection_drop = context.data.initial
          //rete_init.ui.connection_drop = context.data.initial
          await rete_init.area.emit({ type: 'contextmenu', data: { event, context: 'root' } })

        }
        if (isNodeRemoved.value) isNodeRemoved.value = false
      }
      return context
    })
  }


  document.addEventListener('click', (e) => {
    if (menuVisible.value) {
      const target = e.target as HTMLElement
      if (!target.closest('.floating-menu')) {
        closeMenu()
      }
    }
  })

  // document.addEventListener('pointerup', (e) => {
  //   if (e.metaKey || e.ctrlKey) {
  //     const multi_selected: string[] = []
  //     console.log('hey add multi')
  //     if (rete_init.editor && rete_init.editor.getNodes().length > 0) {
  //       rete_init.editor.getNodes().forEach((node) => {
  //         if (node.selected === true) {
  //           multi_selected.push(node.id)
  //         }
  //       })
  //     }
  //     if (multi_selected.length > 1) {
  //       closeNodeOption()
  //       closeMenu()
  //     }
  //     multi_selected_node.value = [...multi_selected]
  //     console.log(multi_selected_node.value)
  //     console.log(selected_node.value)
  //   }
  // })
}


function checkConnectionSocket(data: {
  source: string
  sourceOutput: string
  target: string
  targetInput: string
}) {
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
  if (rete_init.area) {
    const { transform } = rete_init.area.area // Rete.js area transform

    // Step 1: Get the mouse position relative to the Rete.js container
    const containerRect = rete_init.area.container.getBoundingClientRect()
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
    const position = rete_init.area?.nodeViews.get(node.id)?.position // Get node position
    return {
      id: node.id,
      label: node.label,
      controls: node.controls as { [key: string]: ControlInterface },
      outputs: node.outputs as { [key: string]: MetaTemplateOutput } | undefined,
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
  console.log(serializedState)

  //Save The Flow to json
  active_flow.json = parse_serial

  //Create a new Output data of the node
  toast({
    title: 'Flow saved',
    variant: 'success',
    duration: 2000,
  })
}


watch(
  () => rete_init.editor,
  async (init_new) => {
    if (init_new && init_new.getNodes().length > 0) {
      //console.log(rete_init.editor)
      //await saveEditorState()
    }
  },
  { deep: true },
)

watch(
  () => selected_node.value,
  async (new_node) => {
    if (new_node && rete_init.editor) {
      const node = rete_init.editor.getNode(new_node)
      if (node) {
        selected_node_obj.value = node
      }
    }
  },
)

function removeNode(): void {
  if (selected_node.value && rete_init.area && rete_init.editor) {
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

function addCustomBackground() {
  if (rete_init.area) {
    rete_init.area.container.classList.add('background')
    rete_init.area.container.classList.add('bg-dotted')
  }
}


onMounted(async () => {
  await initializeFlow()
})


// Event listeners for mousemove and click


</script>

<template>
  <!-- Rete.js Canvas -->
  <div v-if="draggable.visibility && draggable.node"
    :style="{ top: `${draggable.position.y}px`, left: `${draggable.position.x}px` }"
    class="tracker border-2 border-dashed h-10 px-4 w-auto absolute pointer-events-none -translate-x-[50%] -translate-y-[50%] border-blue-600 flex items-center justify-center text-white font-bold">
    {{ draggable.node.data?.name }}
  </div>

  <div class="h-screen">
    <div id="no-right-click" ref="reteContainer" class="h-svh"></div>
  </div>

  <div class="absolute top-0 flex justify-between p-4">
    <div class="space-y-2">
      <div class="flex gap-4">
        <button class="font-bold" @click="saveEditorState">Save</button>
        <span>
          {{ multi_selected_node.length > 0 ? `${multi_selected_node.length} selected` : '' }}
        </span>
      </div>
    </div>
  </div>

  <NodeSheet v-if="!editor_load" />
  <ActionBar />
</template>

<style scoped>
.bg-dotted {
  background: rgb(42, 42, 42);
  background-image: radial-gradient(currentColor 0.5px, transparent 0.5px);
  color: #404040;
  /* Text color for contrast */
  background-size: 10px 10px;
  /* Adjust size of dots */

  /* Change dot color */
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

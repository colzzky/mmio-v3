<script lang="ts" setup>
import { uiHelpers } from '@/core/utils/ui-helper'
import CustomConnection from '../rete/custom-connection.vue'
import CustomControl from '../rete/customControl.vue'
import NodeSheet from '../rete/sheets/node-sheet.vue'
import { nodeMapping } from '../rete/utils'
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
  ReteTemplates,
  type NodeType,
  nodeMapContextMenu,
  createMetaTemplateOutIn,
  ReteSockets,
  socketDefinitions,
  type SerializedFlow,
  CustomSocket,
} from '@/modules/meta/utils/flow-types'
import { useAuthWorkspaceStore } from '@/stores/authWorkspaceStore'
import { objectEntries } from '@vueuse/core'
import { NodeEditor, ClassicPreset, type NodeId } from 'rete'
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin'
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin'
import { ContextMenuPlugin } from 'rete-context-menu-plugin'
import { VuePlugin, Presets } from 'rete-vue-plugin'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCollection } from '@/core/utils/firebase-collections'
import type { ChatBotFlowService } from '@/core/types/AuthWorkspaceTypes'
import type { ChatbotFlowServiceData } from '@/core/types/WorkSpaceTypes'
import { boolean } from 'zod'
import AlertDialog from '@/core/components/ui/alert-dialog/AlertDialog.vue'
import AlertDialogContent from '@/core/components/ui/alert-dialog/AlertDialogContent.vue'
import AlertDialogHeader from '@/core/components/ui/alert-dialog/AlertDialogHeader.vue'
import AlertDialogTitle from '@/core/components/ui/alert-dialog/AlertDialogTitle.vue'
import AlertDialogDescription from '@/core/components/ui/alert-dialog/AlertDialogDescription.vue'
import AlertDialogFooter from '@/core/components/ui/alert-dialog/AlertDialogFooter.vue'
const route = useRoute()

//** Pending: We need to create an interface when saving editor proceed at line saveEditorState and use it when we reload the state */

interface MousePosition {
  x: number
  y: number
}

const authWorkspace = useAuthWorkspaceStore()
const { active_flow, rete_init } = authWorkspace
const { draggable } = active_flow

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
    items(context: 'root' | Schemes['Node'] | Connection<Node<keyof NodeType>>) {
      if (context === 'root') {
        return {
          searchBar: true,
          list: Object.values(nodeMapContextMenu).map(({ label, key, template }) => ({
            label,
            key,
            handler: async () => {
              const node = ReteTemplates.node_templates[template]()
              if (rete_init.editor) {
                await rete_init.editor.addNode(node)
                await rete_init.contextMenu?.signal.emit('hide')
              }
            },
          })),
        }
      } else {
        if (context instanceof Node) {
          console.log(context)
          return {
            searchBar: false,
            list: [
              {
                label: 'Delete', key: '1', handler: () => {
                  if (rete_init.editor) {
                    for (const [key, connection] of Object.entries(rete_init.editor.getConnections())) {
                      if (connection.target == context.id || connection.source == context.id) {
                        rete_init.editor.removeConnection(connection.id)
                      }
                    }
                    rete_init.editor.removeNode(context.id)
                  }
                }
              },
              {
                label: 'Clone', key: '2', handler: () => {
                  if (context.data && context.data.name) {
                    const newNode = new Node(context.label)
                    newNode.data = uiHelpers.deepCopy(context.data)
                    newNode.data.name = uiHelpers.getNextTitle(context.data.name)
                    if (newNode.data) {
                      createMetaTemplateOutIn(
                        {
                          node: newNode,
                          socket: ReteSockets['text'],
                        },
                        'num',
                        'input',
                      )
                      objectEntries(context.outputs).forEach(([key, output]) => {
                        if (output) {

                          createMetaTemplateOutIn(
                            {
                              node: newNode,
                              socket: ReteSockets[output?.socket.name as keyof typeof socketDefinitions],
                            },
                            output.id
                          )
                        }
                      })
                    }
                    delete context.data.postbackid
                    console.log(context)
                    draggable.toggleNode(newNode)
                  }
                }
              },
            ]
          }
          //For Connections 
        } else {
          return {
            searchBar: false,
            list: [{
              label: 'Delete Connection', key: '1', handler: () => {
                if (rete_init.editor) {
                  rete_init.editor.removeConnection(context.id)
                }

              }
            }]
          }
        }

      }
    },
  })

  // Use the customized preset
  rete_init.render.addPreset(
    Presets.classic.setup({
      customize: {
        node: (context) => nodeMapping[context.payload.label],
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
  rete_init.editor.use(rete_init.readonly.root)
  rete_init.area.use(rete_init.connection)
  rete_init.area.use(rete_init.readonly.area)
  rete_init.area.use(rete_init.render)
  // @ts-ignore: Unreachable code error
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

// Track mouse events and handle right-click
function trackMouseEvents() {
  const area = rete_init.area
  const connection = rete_init.connection
  let context_menu_position = { x: 0, y: 0 }
  let client_position = { x: 0, y: 0 }

  const isNodeRemoved = ref(false)
  if (area) {
    area.addPipe(async (context) => {
      if (context.type === 'pointermove') {
        if (active_flow.ui.connection_drop) {
          client_position = { x: context.data.event.clientX, y: context.data.event.clientY }
        }
      }

      if (context.type === 'connectionremove') {
        console.log('connection remove')
        isNodeRemoved.value = true
        if (rete_init.editor) {
          const soure_node = rete_init.editor.getNode(context.data.source)
          if (soure_node && soure_node.data) {
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

      if (context.type === 'nodecreated') {
        if (rete_init.editor && active_flow.ui.connection_drop) {
          console.log(active_flow.ui.connection_drop)
          const sourceNode = rete_init.editor.getNode(active_flow.ui.connection_drop.nodeId)
          const targetNode = context.data
          if (sourceNode && targetNode) {
            await rete_init.editor.addConnection(
              new Connection(sourceNode, active_flow.ui.connection_drop.key, targetNode, 'num'),
            )
          }
          active_flow.ui.connection_drop = null
        }

        if (rete_init.area) {
          console.log('test')
          await rete_init.area.translate(
            context.data.id,
            getTranslatedMousePosition(context_menu_position),
          )
        }
      }

      if (context.type === 'nodepicked') {
        menuVisible.value = false
        nodeOptionVisible.value = false
        selected_node.value = context.data.id
        multi_selected_node.value = [context.data.id]
        active_flow.node_select(context.data.id)
      }

      if (context.type === 'pointerdown') {
        if (active_flow.selected_node) {
          active_flow.remove_selected_node()
        }
        if (active_flow.ui.connection_drop) {
          active_flow.ui.connection_drop = null
        }
        if (draggable.visibility === true) {
          console.log('test')
          draggable.visibility = false
          if (draggable.node && rete_init.editor && rete_init.area) {
            await rete_init.editor.addNode(draggable.node)

            await rete_init.area.translate(
              draggable.node.id,
              getTranslatedMousePosition(context.data.event),
            )
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
          y: context.data.event.clientY,
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
        active_flow.ui.connection_drop = context.data.socket
      }

      if (context.type === 'connectiondrop') {
        if (!context.data.created && rete_init.area && !isNodeRemoved.value) {
          const event = new PointerEvent('contextmenu', {
            clientX: client_position.x, // Adjust X relative to container
            clientY: client_position.y, // Adjust Y relative to container
          })
          console.log(event)

          active_flow.ui.connection_drop = context.data.initial
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

async function reloadEditor() {
  if (!active_flow.chatbot_flow_data || !rete_init.editor || !rete_init.area) return
  const orig_editor: SerializedFlow.State = JSON.parse(active_flow.chatbot_flow_data.botFlow)
  for (const node of orig_editor.nodes) {
    const newNode = new Node(node.label)
    newNode.data = { ...node.data as NodeType[typeof newNode.label] }
    newNode.id = node.id
    objectEntries(node.inputs).forEach(([key, input]) => {
      if (input) {
        createMetaTemplateOutIn(
          {
            node: newNode,
            socket: ReteSockets[input.label as keyof typeof socketDefinitions],
          },
          input.id,
          'input',
        )
      }
    })
    objectEntries(node.outputs).forEach(([key, output]) => {
      if (output) {
        createMetaTemplateOutIn(
          {
            node: newNode,
            socket: ReteSockets[output.label as keyof typeof socketDefinitions],
          },
          output.id,
        )
      }
    })
    await rete_init.editor.addNode(newNode)
    rete_init.area.translate(node.id, node.position)
  }

  for (const conn of orig_editor.connections) {
    rete_init.editor.addConnection(conn)
  }
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

function addCustomBackground() {
  if (rete_init.area) {
    rete_init.area.container.classList.add('background')
    rete_init.area.container.classList.add('bg-dotted')
  }
}

const pageLoad = ref(true)

onMounted(async () => {
  pageLoad.value = true
  if (!active_flow.chatbot_flow_data) {
    const get_flow = await getCollection('ws_chatbot_flow', {
      $path: 'workspaces/:ws_id/chatbot_flow_service',
      id: route.params.cb_id as string,
      $sub_params: {
        ws_id: route.params.workspaceId as string
      }
    })
    console.log(get_flow)
    if (get_flow.data && get_flow.status) {
      const flow = get_flow.data as ChatbotFlowServiceData
      active_flow.setActiveChatBotFlow(flow)
      initializeFlow()
      await reloadEditor()
    }
  }

  pageLoad.value = false
})

// Event listeners for mousemove and click
</script>

<template>
  <!-- Rete.js Canvas -->
  <div>
    <div v-if="draggable.visibility && draggable.node"
      :style="{ top: `${draggable.position.y}px`, left: `${draggable.position.x}px` }"
      class="tracker pointer-events-none absolute flex h-10 w-auto -translate-x-[50%] -translate-y-[50%] items-center justify-center border-2 border-dashed border-blue-600 px-4 font-bold text-white">
      {{ draggable.node.data?.name }}
    </div>

    <div class="h-screen">
      <div id="no-right-click" ref="reteContainer" class="h-svh"></div>
    </div>

    <div class="absolute top-0 flex justify-between p-4">
      <div class="space-y-2">
        <div class="flex gap-4">
          <span>
            {{ multi_selected_node.length > 0 ? `${multi_selected_node.length} selected` : '' }}
          </span>
        </div>
      </div>
    </div>

    <NodeSheet v-if="!pageLoad && !editor_load" />
    <ActionBar />


  </div>

  <AlertDialog :open="!pageLoad && !editor_load ? false : true">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="flex justify-center gap-2 items-center">
          <div>
            <i class="material-icons animate-spin text-sm">donut_large</i>
          </div>
          <span>Creating your flow..</span>
        </AlertDialogTitle>
        <AlertDialogDescription class="flex justify-center">
          Please wait while we recreate and initialze your flow
        </AlertDialogDescription>
      </AlertDialogHeader>
    </AlertDialogContent>
  </AlertDialog>
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

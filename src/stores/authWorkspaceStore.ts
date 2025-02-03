import type {
  FSReturnData,
  ActiveWorkspace,
  ActiveTeam,
  CurrentMember,
  ChatBotFlowService,
  PostRandomizerService,
  PostRandomizerPosts,
} from '../core/types/AuthWorkspaceTypes'
import type { UserData } from '@/core/types/AuthUserTypes'
import type { MetaPageData } from '@/core/types/MetaTypes'
import type { TeamMembersData } from '@/core/types/TeamTypes'
import {
  chatbot_flow_service_Data,
  post_randomizer_posts_data,
  post_randomizer_service_data,
  type ChatbotFlowServiceData,
  type MetaPageRefs,
  type PostRandomizerPostsData,
  type PostRandomizerServiceData,
} from '@/core/types/WorkSpaceTypes'
import {
  getCollection,
  getWhereAny,
  listenToCollection,
  postCollection,
} from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import type { AreaExtra, Node, NodeType, Schemes, SerializedFlow, Connection as Conn } from '@/modules/meta/utils/flow-types'
import { defineStore } from 'pinia'
import type { NodeEditor } from 'rete'
import type { Connection, ConnectionPlugin, SocketData } from 'rete-connection-plugin'
import type { VuePlugin } from 'rete-vue-plugin'
import { reactive } from 'vue'
import type { AreaPlugin } from 'rete-area-plugin'
import { ReadonlyPlugin } from 'rete-readonly-plugin'
import type { ContextMenuPlugin } from 'rete-context-menu-plugin'
import { toast } from '@/core/components/ui/toast'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { result } from 'lodash'


interface Plugins {
  editor: NodeEditor<Schemes> | null;
  render: VuePlugin<Schemes, AreaExtra> | null;
  contextMenu: ContextMenuPlugin<Schemes> | null;
  connection: ConnectionPlugin<Schemes, AreaExtra> | null;
  area: AreaPlugin<Schemes, AreaExtra> | null;
  readonly: ReadonlyPlugin<Schemes>;
}

export const useAuthWorkspaceStore = defineStore('authWorkspaceStore', () => {
  const active_workspace = reactive<ActiveWorkspace>({
    data: null,
    meta_page_refs:[],
    isInitialized: false,
    isLoading: false,
    reset() { },
  })
  const active_team = reactive<ActiveTeam>({
    data: null,
    members: {},
    isInitialized: false,
    isLoading: false,
    reset() { },
  })
  const current_member = reactive<CurrentMember>({
    data: null,
    isOwner: false,
    isInitialized: false,
    isLoading: false,
    listener: null,
    reset() { },
    async listen(tm_id: string, member_id: string) {
      current_member.listener = await listenToCollection(DbCollections.team_members,
        {
          id:member_id,
          $sub_params:{
            tm_id
          }
        },
        (data) => {
          if(data.data){
            this.data = data.data
            console.log(data)
          }

        },
      )
    },
  })

  const imported_meta_pages = reactive({
    data: [] as MetaPageData[],
    reference: [] as MetaPageRefs[],
    isInitialized: false as boolean,
    isLoading: false as boolean,
    lastSnapshot: '' as string,
    nextFetch: '' as string,
    generateNextFetch() {
      this.nextFetch = uiHelpers.generateExpirationDate(10)
    },
    checkNextFetch() {
      if (this.nextFetch) {
        const now = new Date()
        const expireDate = new Date(this.nextFetch)
        console.log(expireDate)
        return now >= expireDate
      }
      return true
    },
    resetData() {
      this.data = []
      this.isInitialized = false
      this.isLoading = false
      this.lastSnapshot = ''
    },
    async fetch_meta_pages() {
      if (this.checkNextFetch()) {
        this.isLoading = true
        this.reference = []
        this.data = []
        const work_page_ids: string[] = []
        const imported_by_ids: string[] = []
        if (active_workspace.data && active_workspace.meta_page_refs.length > 0) {
          active_workspace.meta_page_refs.forEach((wp) => {
            work_page_ids.push(wp.mp_id)
            imported_by_ids.push(wp.updatedAt)
          })
          if (work_page_ids.length > 0) {
            const fetch_meta_pages = await getWhereAny(DbCollections.meta_pages, {
              $sub_params: {},
              whereConditions: [
                {
                  fieldName: 'mp_id',
                  operator: 'in',
                  value: work_page_ids,
                },
              ],
            })

            if (fetch_meta_pages.status && fetch_meta_pages.data.length > 0) {
              this.data = fetch_meta_pages.data
              const get_user_import = await getWhereAny(DbCollections.users, {
                $sub_params: {},
                whereConditions: [{ fieldName: 'uid', operator: 'in', value: imported_by_ids }],
              })

              const meta_page_reference = active_workspace.meta_page_refs
              this.data.forEach((data) => {
                const ref = meta_page_reference.find((ref) => (ref.mp_id = data.mp_id))
                let user: UserData | undefined = undefined
                if (get_user_import.data.length > 0) {
                  user = get_user_import.data.find((user) => (user.uid = data.owner_uid))
                }
                if (ref) {
                  this.reference.push({
                    mp_id: data.mp_id,
                    imported_by: user && user.displayName ? user.displayName : '',
                    image: data.picture ? data.picture.data.url : '',
                    page_name: data.name,
                    importedAt: ref.createdAt,
                    updatedAt: ref.updatedAt,
                  })
                }
              })
            }
          }
        }
        this.generateNextFetch()
        this.isLoading = false
        this.isInitialized = true
      }
    },
  })

  const service_models = {
    chatbot_flow: reactive<ChatBotFlowService>({
      data: { ...chatbot_flow_service_Data },
      reInit() {
        this.data = { ...chatbot_flow_service_Data }
        //this is team
      },
      set(data: ChatbotFlowServiceData) {
        this.data = data
      }
    }),
    post_randomizer: reactive<PostRandomizerService>({
      data: { ...post_randomizer_service_data },
      reInit() {
        this.data = { ...post_randomizer_service_data }
        //this is team
      },
      set(data) {
        this.data = data
      }
    }),
    post_randomizer_posts: reactive<PostRandomizerPosts>({
      data: { ...post_randomizer_posts_data },
      reInit() {
        this.data = { ...post_randomizer_posts_data }
        //this is team
      },
      set(data) {
        this.data = data
      }
    }),
  }



  const workspace_service = {
    chatbot_flow: reactive({
      data: [] as ChatbotFlowServiceData[],
      isInitialized: false as boolean,
      isLoading: false as boolean,
      lastSnapshot: '' as string,
      resetData(): void {
        this.data = []
        this.isInitialized = false
        this.isLoading = false
        this.lastSnapshot = ''
      },
      async fetch_chatbots(): Promise<void> {
        this.isLoading = true
        this.data = []
        if (active_workspace.data) {
          const fetch_chatbots = await getWhereAny(DbCollections.ws_chatbot_flow, {
            $sub_params: { ws_id: active_workspace.data.ws_id },
          })
          console.log(fetch_chatbots)
          if (fetch_chatbots.status && fetch_chatbots.data.length > 0) {
            this.data = fetch_chatbots.data
          }
        }
        this.isLoading = false
        this.isInitialized = true
      },
    }),
    post_randomizer: reactive({
      data: [] as PostRandomizerServiceData[],
      isInitialized: false as boolean,
      isLoading: false as boolean,
      lastSnapshot: '' as string,
      nextFetch: '' as string,
      generateNextFetch(): void {
        this.nextFetch = uiHelpers.generateExpirationDate(10)
      },
      checkNextFetch(): boolean {
        if (this.nextFetch) {
          const now = new Date()
          const expireDate = new Date(this.nextFetch)
          console.log(expireDate)
          return now >= expireDate
        }
        return true
      },
      resetData(): void {
        this.data = []
        this.isInitialized = false
        this.isLoading = false
        this.lastSnapshot = ''
      },
      async fetch_campaigns(isNext: boolean = false): Promise<void> {
        if (this.checkNextFetch() || isNext) {
          this.isLoading = true
          if (!isNext) {
            this.data = []
            this.lastSnapshot = ''
          }

          if (active_workspace.data && active_workspace.meta_page_refs.length >0) {
            const fetch_data = await getWhereAny(DbCollections.ws_post_randomizer, {
              $sub_params: { ws_id: active_workspace.data.ws_id },
              limitResult: 10,
              lastDocumentId: this.lastSnapshot,
            })
            if (fetch_data.status && fetch_data.data.length > 0) {
              this.data = fetch_data.data
              this.lastSnapshot = this.data[this.data.length - 1].pr_id
            }
          }
          this.generateNextFetch()
          this.isLoading = false
          this.isInitialized = true
        }
      },
    }),
  }
  const active_flow = reactive({
    chatbot_flow_data: null as ChatbotFlowServiceData|null,
    json: '' as string,
    selected_node_id: '' as string,
    selected_node: null as Node<keyof NodeType> | null,
    ui: {
      menuPanelMinimized: false as boolean,
      selectionPanelMinimized: false as boolean,
      read_only_mode: false as boolean,
      connection_drop: null as null | SocketData,
      minimizeMenuPanel() {
        this.menuPanelMinimized = !this.menuPanelMinimized
      },
      minimizeSelectionPanel() {
        this.selectionPanelMinimized = !this.selectionPanelMinimized
      },
      enableReadOnly() {
        if (!this.read_only_mode) {
          rete_init.readonly.enable()
          this.read_only_mode = true
        } else {
          rete_init.readonly.disable()
          this.read_only_mode = false
        }

      },
    },
    draggable: {
      visibility: false as boolean,
      position: { x: 0, y: 0 },
      node: null as Node<keyof NodeType> | null,
      toggleNode(node: Node<keyof NodeType>) {
        this.visibility = !this.visibility;
        this.node = node
      },
      updatePosition(event: MouseEvent) {

        this.position = {
          x: event.clientX - 25, // Centering the div
          y: event.clientY - 25,
        };
      }
    },
    async node_select(id: string) {
      this.remove_selected_node()
      const node = rete_init.editor?.getNode(id)
      if (node && rete_init.area) {
        if (!node.selected) {
          node.selected = true
          rete_init.area.update('node', node.id)
        }
        this.selected_node_id = id
        this.selected_node = node
      }
    },
    remove_selected_node() {
      if (this.selected_node && rete_init.area) {
        const node = rete_init.editor?.getNode(this.selected_node.id)
        if (node) {
          node.selected = false
          rete_init.area.update('node', this.selected_node.id)
        }
      }
      this.selected_node_id = ''
      this.selected_node = null
    },
    setActiveChatBotFlow(data: ChatbotFlowServiceData) {
      this.chatbot_flow_data = data
    },
    async saveEditorState() {
      console.log('save')
      if (!rete_init.editor || !this.chatbot_flow_data) return
      const serializedNode: SerializedFlow.Node<keyof NodeType>[] = rete_init.editor.getNodes().map(node => ({
        id: node.id,
        label: node.label,
        controls: node.controls,
        outputs: node.outputs,
        inputs: node.inputs,
        data: node.data ? node.data : null, // Use default empty object
        position: rete_init.area?.nodeViews.get(node.id)?.position ?? { x: 0, y: 0 }, // Use nullish coalescing
      }));
      const serializedConnection: Conn<Node<keyof NodeType>>[] = rete_init.editor.getConnections().map(conn => conn);

      const serializedState: SerializedFlow.State = {
        nodes: serializedNode,
        connections: serializedConnection,
        signal: rete_init.editor.signal as any,
        name: rete_init.editor.name as string,
      }
      const parse_serial = JSON.stringify(serializedState)
      const post = await postCollection(DbCollections.ws_chatbot_flow, {
        data: {
          ...this.chatbot_flow_data,
          botFlow: parse_serial
        },
        idKey: 'cb_id',
        $sub_params: {
          ws_id: active_workspace.data ? active_workspace.data.ws_id : ''
        },
      })

      //Create a new Output data of the node
      toast({
        title: 'Flow saved',
        variant: 'success',
        duration: 2000,
      })
    }
  })
  const rete_init: Plugins = ({
    editor: null,
    render: null,
    contextMenu: null,
    connection: null,
    area: null,
    readonly: new ReadonlyPlugin<Schemes>(),

  })

  function returnHome() {
    if (current_member.listener) {
      current_member.listener()
    }

    current_member.listener = null
  }

  return {
    active_workspace,
    active_team,
    current_member,
    imported_meta_pages,
    workspace_service,
    service_models,
    returnHome,
    active_flow,
    rete_init
  }
})

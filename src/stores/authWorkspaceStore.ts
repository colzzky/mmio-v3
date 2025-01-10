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
import type { AreaExtra, Node, NodeType, Schemes } from '@/modules/meta/utils/flow-types'
import { defineStore } from 'pinia'
import type { NodeEditor } from 'rete'
import type { ConnectionPlugin } from 'rete-connection-plugin'
import type { VuePlugin } from 'rete-vue-plugin'
import { reactive } from 'vue'
import type { AreaPlugin } from 'rete-area-plugin'
import { ReadonlyPlugin } from 'rete-readonly-plugin'

export const useAuthWorkspaceStore = defineStore('authWorkspaceStore', () => {
  const active_workspace = reactive<ActiveWorkspace>({
    data: null,
    isInitialized: false,
    isLoading: false,
    reset() {},
  })
  const active_team = reactive<ActiveTeam>({
    data: null,
    members: {},
    isInitialized: false,
    isLoading: false,
    reset() {},
  })
  const current_member = reactive<CurrentMember>({
    data: null,
    isOwner: false,
    isInitialized: false,
    isLoading: false,
    listener: null,
    reset() {},
    async listen(tm_id: string, member_id: string) {
      current_member.listener = await listenToCollection(
        'team_members',
        'teams/:tm_id/team_members',
        { tm_id },
        member_id,
        [],
        (data) => {
          this.data = data as TeamMembersData
          console.log(data)
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
        if (active_workspace.data && active_workspace.data.meta_pages_refs) {
          active_workspace.data.meta_pages_refs.forEach((wp) => {
            work_page_ids.push(wp.mp_id)
            imported_by_ids.push(wp.imported_by_uid)
          })
          if (work_page_ids.length > 0) {
            const fetch_meta_pages = await getWhereAny('meta_page', {
              $path: 'meta_pages',
              $sub_params: {},
              $sub_col: [],
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
              const get_user_import = await getWhereAny('user', {
                $path: 'users',
                $sub_params: {},
                $sub_col: [],
                whereConditions: [{ fieldName: 'uid', operator: 'in', value: imported_by_ids }],
              })

              const meta_page_reference = active_workspace.data.meta_pages_refs
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
      },
      async get(cb_id: string): Promise<FSReturnData<ChatbotFlowServiceData>> {
        const activeWorkSpace = active_workspace.data ? active_workspace.data.ws_id : ''
        const get = await getCollection('ws_chatbot_flow', {
          $path: 'workspaces/:ws_id/chatbot_flow_service',
          $sub_params: { ws_id: activeWorkSpace },
          id: cb_id,
          $sub_col: [],
        })

        return {
          status: get.status,
          data: get.data as ChatbotFlowServiceData,
          error: get.error,
        }
      },
      async createUpdate(type): Promise<FSReturnData<ChatbotFlowServiceData>> {
        const activeWorkSpace = active_workspace.data ? active_workspace.data.ws_id : ''
        const id = this.data.cb_id !== '' ? this.data.cb_id : crypto.randomUUID()
        this.data.cb_id = id
        const post = await postCollection('ws_chatbot_flow', {
          $path: 'workspaces/:ws_id/chatbot_flow_service',
          $sub_params: { ws_id: activeWorkSpace },
          id: id,
          data: this.data,
          type: type,
        })

        console.log(post)
        return {
          status: post.status,
          data: post.data as ChatbotFlowServiceData,
          error: post.error,
        }
      },
    }),
    post_randomizer: reactive<PostRandomizerService>({
      data: { ...post_randomizer_service_data },
      reInit() {
        this.data = { ...post_randomizer_service_data }
        //this is team
      },
      set(data) {
        this.data = data
      },
      async get(pr_id) {
        const activeWorkSpace = active_workspace.data ? active_workspace.data.ws_id : ''
        const get = await getCollection('ws_post_randomizer', {
          $path: 'workspaces/:ws_id/post_randomizer_service',
          $sub_params: { ws_id: activeWorkSpace },
          id: pr_id,
          $sub_col: [],
        })
        return {
          status: get.status,
          data: get.data as PostRandomizerServiceData,
          error: get.error,
        }
      },
      async createUpdate(type) {
        const activeWorkSpace = active_workspace.data ? active_workspace.data.ws_id : ''
        const id = this.data.pr_id !== '' ? this.data.pr_id : crypto.randomUUID()
        this.data.pr_id = id
        const post = await postCollection('ws_post_randomizer', {
          $path: 'workspaces/:ws_id/post_randomizer_service',
          $sub_params: { ws_id: activeWorkSpace },
          id: id,
          data: this.data,
          type: type,
        })

        console.log(post)
        return {
          status: post.status,
          data: post.data as PostRandomizerServiceData,
          error: post.error,
        }
      },
    }),
    post_randomizer_posts: reactive<PostRandomizerPosts>({
      data: { ...post_randomizer_posts_data },
      reInit() {
        this.data = { ...post_randomizer_posts_data }
        //this is team
      },
      set(data) {
        this.data = data
      },
      async get(pr_id, prp_id) {
        const activeWorkSpace = active_workspace.data ? active_workspace.data.ws_id : ''
        const get = await getCollection('ws_post_randomizer_posts', {
          $path: 'workspaces/:ws_id/post_randomizer_service/:pr_id/post_randomizer_posts',
          $sub_params: { ws_id: activeWorkSpace, pr_id: pr_id },
          id: prp_id,
          $sub_col: [],
        })
        return {
          status: get.status,
          data: get.data as PostRandomizerPostsData,
          error: get.error,
        }
      },
      async createUpdate(pr_id, type) {
        const activeWorkSpace = active_workspace.data ? active_workspace.data.ws_id : ''
        const id = this.data.prp_id !== '' ? this.data.prp_id : crypto.randomUUID()
        this.data.prp_id = id
        console.log(this.data)
        const post = await postCollection('ws_post_randomizer_posts', {
          $path: 'workspaces/:ws_id/post_randomizer_service/:pr_id/post_randomizer_posts',
          $sub_params: { ws_id: activeWorkSpace, pr_id: pr_id },
          id: id,
          data: this.data,
          type: type,
        })
        return {
          status: post.status,
          data: post.data as PostRandomizerPostsData,
          error: post.error,
        }
      },
    }),
  }
  const workspace_service = {
    chatbot_flow: reactive({
      data: [] as ChatbotFlowServiceData[],
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
      async fetch_chatbots(): Promise<void> {
        if (this.checkNextFetch()) {
          this.isLoading = true
          this.data = []
          if (active_workspace.data && active_workspace.data.meta_pages_refs) {
            const fetch_chatbots = await getWhereAny('ws_chatbot_flow', {
              $path: 'workspaces/:ws_id/chatbot_flow_service',
              $sub_params: { ws_id: active_workspace.data.ws_id },
              $sub_col: [],
              whereConditions: [],
              orderConditions: [],
            })

            if (fetch_chatbots.status && fetch_chatbots.data.length > 0) {
              this.data = fetch_chatbots.data
            }
          }
          this.generateNextFetch()
          this.isLoading = false
          this.isInitialized = true
        }
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

          if (active_workspace.data && active_workspace.data.meta_pages_refs) {
            const fetch_data = await getWhereAny('ws_post_randomizer', {
              $path: 'workspaces/:ws_id/post_randomizer_service',
              $sub_params: { ws_id: active_workspace.data.ws_id },
              $sub_col: [],
              whereConditions: [],
              orderConditions: [],
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
    json: '' as string,
    rete_init: {
      selected_node_id:'' as string,
      selected_node: null as Node<keyof NodeType> | null,
      
      ui:{
        menuPanelMinimized:false as boolean,
        selectionPanelMinimized:false as boolean,
        read_only_mode: false as boolean,
        minimizeMenuPanel(){
          this.menuPanelMinimized = !this.menuPanelMinimized
        },
        minimizeSelectionPanel(){
          this.selectionPanelMinimized = !this.selectionPanelMinimized
        },
        enableReadOnly(){
          if(!this.read_only_mode){
            active_flow.rete_init.readonly.enable()
            this.read_only_mode = true
          }else{
            active_flow.rete_init.readonly.disable()
            this.read_only_mode = false
          }
          
        },
      },

      async node_select(id:string){
        this.remove_selected_node()
        const node = this.editor?.getNode(id)
        if(node && this.area){
          if(!node.selected){
            node.selected = true
            this.area.update('node', node.id)
          }
          this.selected_node_id = id
          this.selected_node = node
        }
      },
      remove_selected_node(){
        if(this.selected_node && this.area){
          const node = this.editor?.getNode(this.selected_node.id)
          if(node){
            node.selected = false
            this.area.update('node', this.selected_node.id)
          }
        }
        this.selected_node_id = ''
        this.selected_node = null
      },
      editor: null as NodeEditor<Schemes> | null,
      render: null as VuePlugin<Schemes, AreaExtra> | null,
      connection: null as ConnectionPlugin<Schemes, AreaExtra> | null,
      area:null as AreaPlugin<Schemes, AreaExtra> | null,
      readonly: new ReadonlyPlugin<Schemes>()
    },
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
  }
})

import type { UserData } from '@/core/types/AuthUserTypes'
import type { MetaPageData } from '@/core/types/MetaTypes'
import type { TeamData, TeamMembersData } from '@/core/types/TeamTypes'
import { chatbot_flow_service_Data, workspace_data, type ChatbotFlowServiceData, type MetaPageRefs, type WorkspaceData, type WSMetaPagesRefsData } from '@/core/types/WorkSpaceTypes'
import { getCollection, getWhereAny, listenToCollection, postCollection } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

interface FirebaseReturn {
  status: boolean;
  data: DocumentData | undefined;
  error: string;
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>;
type FSReturnData<T> = FirebaseReturnBase & {
  data: T;
};

interface ActiveWorkspace {
  data: WorkspaceData | null,
  isInitialized: boolean,
  isLoading: boolean,
  reset: () => void
}
interface ActiveTeam {
  data: TeamData | null,
  isInitialized: boolean,
  isLoading: boolean,
  reset: () => void
}
interface CurrentMember {
  data: TeamMembersData | null
  isOwner: boolean
  isInitialized: boolean
  isLoading: boolean
  listener: (() => void) | null
  reset: () => void
  listen: (tm_id: string, member_id: string) => Promise<void>
}
interface ChatBotFlowService {
  data: ChatbotFlowServiceData
  reInit: () => void,
  set: (data: ChatbotFlowServiceData) => void
  get: (cb_id:string) => Promise<FSReturnData<ChatbotFlowServiceData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<ChatbotFlowServiceData>>
}


export const useAuthWorkspaceStore = defineStore('authWorkspaceStore', () => {
  const active_workspace = reactive<ActiveWorkspace>({
    data: null,
    isInitialized: false,
    isLoading: false,
    reset() { },
  })
  const active_team = reactive<ActiveTeam>({
    data: null,
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
      current_member.listener = await listenToCollection("team_members", "teams/:tm_id/team_members", { tm_id }, member_id, [],
        (data) => {
          console.log(data)
          this.data = data as TeamMembersData
        }
      );
    }
  })
  const imported_meta_pages = reactive({
    data: <MetaPageData[]>[],
    reference: <MetaPageRefs[]>[],
    isInitialized: <boolean>false,
    isLoading: <boolean>false,
    lastSnapshot: <any>'',
    nextFetch: <string>'',
    generateNextFetch() {
      this.nextFetch = uiHelpers.generateExpirationDate(10)
    },
    checkNextFetch() {
      if (this.nextFetch) {
        const now = new Date();
        const expireDate = new Date(this.nextFetch);
        console.log(expireDate)
        return now >= expireDate;
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
          active_workspace.data.meta_pages_refs.forEach(wp => {
            work_page_ids.push(wp.mp_id)
            imported_by_ids.push(wp.imported_by_uid)
          })
          const fetch_meta_pages = await getWhereAny('meta_page', 'meta_pages', {}, [], [{
            fieldName: 'mp_id', operator: 'in', value: work_page_ids
          }])
          if (fetch_meta_pages.status) {
            this.data = fetch_meta_pages.data
            const get_user_import = await getWhereAny('user', 'users', {}, [], [
              { fieldName: 'uid', operator: 'in', value: imported_by_ids }
            ])
            const meta_page_reference = active_workspace.data.meta_pages_refs
            this.data.forEach(data => {
              const ref = meta_page_reference.find(ref => ref.mp_id = data.mp_id)
              let user = <UserData | undefined>undefined
              if (get_user_import.data.length > 0) {
                user = get_user_import.data.find(user => user.uid = data.owner_uid)
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
        this.generateNextFetch()
        this.isLoading = false
        this.isInitialized = true
      }
    }
  })
  const service_models = {
    chatbot_flow:reactive<ChatBotFlowService>({
      data: { ...chatbot_flow_service_Data },
      reInit() {
        this.data = { ...chatbot_flow_service_Data}
        //this is team
      },
      set(data: ChatbotFlowServiceData) {
        this.data = data
      },
      async get(cb_id:string): Promise<FSReturnData<ChatbotFlowServiceData>> {
        const active_workspacse = active_workspace.data? active_workspace.data.ws_id : ''
        const get = await getCollection('WsChatbotFlow', 'workspaces/:ws_id/chatbot_flow_services', {ws_id:active_workspacse}, cb_id, [])
        return {
          status: get.status,
          data: get.data as ChatbotFlowServiceData,
          error: get.error,
        }
      },
      async createUpdate(type): Promise<FSReturnData<ChatbotFlowServiceData>> {
        const active_workspacse = active_workspace.data? active_workspace.data.ws_id : ''
        const id = this.data.cb_id !== '' ? this.data.cb_id : crypto.randomUUID();
        this.data.cb_id = id
        const post = await postCollection('WsChatbotFlow', 'workspaces/:ws_id/chatbot_flow_services', {ws_id:active_workspacse}, id, this.data, type)
        console.log(post)
        return {
          status: post.status,
          data: post.data as ChatbotFlowServiceData,
          error: post.error,
        }
      },
    })
  }
  const workspace_service = {
    chatbot_flow:reactive({
      data: <ChatbotFlowServiceData[]>[],
      isInitialized: <boolean>false,
      isLoading: <boolean>false,
      lastSnapshot: <any>'',
      nextFetch: <string>'',
      generateNextFetch() {
        this.nextFetch = uiHelpers.generateExpirationDate(10)
      },
      checkNextFetch() {
        if (this.nextFetch) {
          const now = new Date();
          const expireDate = new Date(this.nextFetch);
          console.log(expireDate)
          return now >= expireDate;
        }
        return true
      },
      resetData() {
        this.data = []
        this.isInitialized = false
        this.isLoading = false
        this.lastSnapshot = ''
      },
      async fetch_chatbots() {
        if (this.checkNextFetch()) {
          this.isLoading = true
          this.data = []
          if (active_workspace.data && active_workspace.data.meta_pages_refs) {
            const fetch_chatbots = await getWhereAny('WsChatbotFlow', 'workspaces/:ws_id/chatbot_flow_services', {ws_id:active_workspace.data.ws_id}, [], [])
            if (fetch_chatbots.status && fetch_chatbots.data.length > 0) {
              this.data = fetch_chatbots.data
            }
          }
          this.generateNextFetch()
          this.isLoading = false
          this.isInitialized = true
        }
      }
    })
  }
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

    returnHome
  }
},
)

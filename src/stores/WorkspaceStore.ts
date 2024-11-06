import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes'
import type { DocumentData } from 'firebase/firestore'
import { useAuthStore } from './authStore'
import { reactive } from 'vue'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import { defineStore } from 'pinia'

interface Workspace {
  data: WorkspaceData | null
  isInitialized: boolean
  initialize: () => void,
  set: (data: WorkspaceData) => void
  get: (ws_id: string) => Promise<WorkspaceDataReturnData>
  createUpdate: (type: 'new' | 'update') => Promise<WorkspaceDataReturnData>
  resetData: () => void
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type WorkspaceDataReturnData = FirebaseReturnBase & {
  data: WorkspaceData
}

const useAuth = useAuthStore()
const { user_auth } = useAuth
export const useWorkspaceStore = defineStore('workspaceStore', () => {
  const workspace = reactive<Workspace>({
    // Data of the Workspace
    data: null,

    //Check to know if initialized or not. I means that there is an existing data
    isInitialized: false,

    // Initialize data to default value. Check workspace_data for the default walue
    initialize() {
      this.data = { ...workspace_data }
      this.isInitialized = true
    },

    // Default get to fetch workspace from firestore depending on the id
    async get(ws_id: string):Promise<WorkspaceDataReturnData> {
      const get = await getCollection('workspaces', 'workspaces', {}, ws_id, [])
      return {
        status: get.status,
        data: get.data as WorkspaceData,
        error: get.error,
      }
    },

    /**
    * Default create or update to set firesotre. We pass type to know if its new or update
    * if there is an initialized data then we use the ws_id of that data
    * If the ws_id is an empty string. We generate randomUUID
    */
    async createUpdate(type):Promise<WorkspaceDataReturnData> {
      let id = this.data?.ws_id ? this.data.ws_id : crypto.randomUUID();
      if (this.data) this.data.ws_id = id
      const post = await postCollection('workspaces', 'workspaces', null, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as WorkspaceData,
        error: post.error,
      }
    },

    // If you were able to fetch the data you can initlize and set it with this function
    set(data:WorkspaceData):WorkspaceData {
      this.data = data
      this.isInitialized = true
      return this.data
    },

    // Reset initialized data here
    resetData() {
      this.data = null
      this.isInitialized = false
    },
  })


  const workspace_list = reactive({
    data: <WorkspaceData[]>[],
    isInitialized: <boolean>false,
    isLoading: <boolean>false,
    lastSnapshot: <any>'',
    resetData() {
      this.data = []
      this.isInitialized = false
      this.isLoading = false
      this.lastSnapshot = ''
    },
  })


  const reset_state = () => {
    workspace_list.resetData()
    workspace.resetData()
  }

  return {
    workspace_list,
    workspace_data,
    reset_state
  }
})

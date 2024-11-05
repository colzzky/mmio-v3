import type { MetaPagesData } from '@/core/types/MetaTypes'
import type { MetaAPIAccount } from '@/core/types/PlaformAPITypes'
import type { WorkspaceData, Platforms } from '@/core/types/WorkSpaceTypes'
import {
  postCollection,
  getCollection,
  getCollectionByField,
  getBySub,
  getWhereAny
} from '@/core/utils/firebase-collections'
import type { CollectionWhereCondition, FirebaseOrderCondition, FirebaseWhereCondition } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { usePlatformAPIStore } from '@/stores/platformAPIStore'
import { useAuthStore } from './authStore'

interface Project {
  data: WorkspaceData | null
  isInitialized: boolean
  initialize: () => void
  get: (id: string, subCollections: string[]) => Promise<ProjectReturnData>
  getBySubCol: (id: string, subCollections: string[]) => Promise<ProjectReturnData>


  getWhere: (where: FirebaseWhereCondition<'workspaces'>[], limit?: number, orderBy?: FirebaseOrderCondition<'workspaces'>[], startAfterDoc?: string) => Promise<ProjectReturnList>

  createUpdateBySubCol: (type: 'new' | 'update') => Promise<ProjectReturnData>
  createUpdate: (type: 'new' | 'update') => Promise<ProjectReturnData>

  set: (data: WorkspaceData) => WorkspaceData
  resetData: () => void
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

// type Nullable<T> = {
//   [P in keyof T]: T[P] | null
// }
// // Add a new key "id" while preserving original keys
// type PickAnyKey<T> = {
//   // Original keys from UserProfileData
//   [K in keyof T]?: T[K]
// }

type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type ProjectReturnList = FirebaseReturnBase & {
  data: WorkspaceData[]
}
type ProjectReturnData = FirebaseReturnBase & {
  data: WorkspaceData
}

export const useProjectStore = defineStore('projectStore', () => {
  const useAuth = useAuthStore()
  const { user_auth } = useAuth
  const workspace_ui_page = reactive({
    isInitialize: <boolean>false,
    workspace_id: <string>'',
    async initializeProjData(): Promise<boolean> {
      const { platformAPI } = usePlatformAPIStore()
      if (this.workspace_id && user_auth.data) {
        if (!workspace_data.data || !workspace_data.isInitialized) {
          const get = await workspace_data.get(this.workspace_id as string, [])
          console.log(get)
          if (!get.status) return false
          if (!get.data.shared_uids.includes(user_auth.data.uid)) return false
          workspace_data.set(get.data)
        }
        if (this.workspace_id != workspace_data.data?.ws_id) return false
        if (workspace_data.data.platform === 'META') {
          const meta_page = <MetaPagesData>workspace_data.data.connectedAccount
          const getPlatform = await platformAPI.get(meta_page.pa_id)
          if (getPlatform.status) {
            const fb_api_account = getPlatform.data.api_account as MetaAPIAccount
            if (uiHelpers.isTokenExpired(fb_api_account.expiresIn)) {
              console.log('token is expired')
            }
            return true
          } else {
            return false
          }
        }
      }
      return false
    }
  })

  const workspace_data = reactive<Project>({
    data: null,
    isInitialized: false,
    initialize() {
      this.data = {
        ws_id: '',
        account_id: '',
        connectedAccount: null,
        uid: '',
        name: '',
        shared_uids: [],
        platform: '',
        status: '',
        createdAt: '',
        updatedAt: '',
        updatedBy: '',
        subCollections: ['subCollection1', 'subCollection2'],
        subCollection1: [],
        subCollection2: []
      }
      this.isInitialized = true
    },
    async get(id: string, subCollections = []) {
      const get = await getCollection('workspaces', 'ws_id', id, subCollections)
      return {
        status: get.status,
        data: get.data as WorkspaceData,
        error: get.error,
      }
    },

    async getBySubCol(id: string, subCollections = []) {
      const get = await getBySub('workspaces', id, subCollections)
      return {
        status: get.status,
        data: get.data as WorkspaceData, //Depends on whats declared here
        error: get.error,
      }
    },

    async getWhere(where, limit, orderBy, snapshot) {
      const get = await getCollectionByField('workspaces', 'ws_id', where, limit, orderBy, snapshot)
      return {
        status: get.status,
        data: get.data as WorkspaceData[],
        error: get.error,
      }
    },
    
    async createUpdate(type) {
      const id = type === 'new' ? crypto.randomUUID() : this.data ? this.data.ws_id : ''
      if (this.data) this.data.ws_id = id
      const post = await postCollection('workspaces', 'ws_id', id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as WorkspaceData,
        error: post.error,
      }
    },

    async createUpdateBySubCol(type) {
      const id = type === 'new' ? crypto.randomUUID() : this.data ? this.data.ws_id : ''
      if (this.data) this.data.ws_id = id
      const post = await postBySub('workspaces', id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as WorkspaceData,
        error: post.error,
      }
    },


    //Only set after fetch
    set(data) {
      this.data = data
      this.isInitialized = true
      return this.data
    },
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
    workspace_data.resetData()

  }

  const get_collection_special = async () => {
    //Use this for special call and condition only it will getch anything 
    const get = await getWhereAny<WorkspaceData>('', [], [{
      fieldName: 'account_id',
      operator: '==',
      value: 'sassadas'
    }], [{ fieldName: 'account_id', direction: 'asc' }], 10, undefined)
  }

  return {
    workspace_list,
    workspace_data,
    workspace_ui_page,
    reset_state
  }
})

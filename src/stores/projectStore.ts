import type { MetaPagesData } from '@/core/types/MetaTypes'
import type { MetaAPIAccount } from '@/core/types/PlaformAPITypes'
import type { ProjectData, Platforms } from '@/core/types/ProjectTypes'
import {
  postCollection,
  getCollection,
  getCollectionByField,
} from '@/core/utils/firebase-collections'
import type { FirebaseOperators, FirebaseOrderCondition, FirebaseWhereCondition } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { usePlatformAPIStore } from '@/stores/platformAPIStore'

interface Project {
  data: ProjectData | null
  isInitialized: boolean
  initialize: () => void
  get: (id: string) => Promise<ProjectReturnData>
  getWhere: (where: FirebaseWhereCondition<'projects'>[], limit?: number, orderBy?: FirebaseOrderCondition<'projects'>[], startAfterDoc?: string) => Promise<ProjectReturnList>
  createUpdate: (type: 'new' | 'update') => Promise<ProjectReturnData>
  set: (data: ProjectData) => ProjectData
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
  data: ProjectData[]
}
type ProjectReturnData = FirebaseReturnBase & {
  data: ProjectData
}

export const useProjectStore = defineStore('projectStore', () => {
  const project_ui_page = reactive({
    isInitialize: <boolean>false,
    project_id: <string>'',
    async initializeProjData():Promise<boolean> {
      const { platformAPI } = usePlatformAPIStore()
      if (this.project_id) {
        if (!project_data.data || !project_data.isInitialized) {
          const get = await project_data.get(this.project_id as string)
          if (!get.status) return false
          project_data.set(get.data)
        }
        if (this.project_id != project_data.data?.pj_id) return false
        if (project_data.data.platform === 'META') {
          const meta_page = <MetaPagesData>project_data.data.connectedAccount
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

  const project_data = reactive<Project>({
    data: null,
    isInitialized: false,
    initialize() {
      this.data = {
        pj_id: '',
        account_id: '',
        connectedAccount: null,
        uid: '',
        name: '',
        platform: '',
        status: '',
        createdAt: '',
        updatedAt: '',
      }
      this.isInitialized = true
    },
    async get(id: string) {
      const get = await getCollection('projects', 'pj_id', id)
      return {
        status: get.status,
        data: get.data as ProjectData,
        error: get.error,
      }
    },
    async getWhere(where, limit, orderBy, snapshot) {
      const get = await getCollectionByField('projects', 'pj_id', where, limit, orderBy, snapshot)
      return {
        status: get.status,
        data: get.data as ProjectData[],
        error: get.error,
      }
    },
    async createUpdate(type) {
      const id = type === 'new' ? crypto.randomUUID() : this.data ? this.data.pj_id : ''
      if (this.data) this.data.pj_id = id
      const post = await postCollection('projects', 'pj_id', id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as ProjectData,
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
  const project_list = reactive({
    data: <ProjectData[]>[],
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
    project_list.resetData()
    project_data.resetData()

  }

  return {
    project_list,
    project_data,
    project_ui_page,
    reset_state
  }
})

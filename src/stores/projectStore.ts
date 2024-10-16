import {
  postCollection,
  getCollection,
  getCollectionByField,
} from '@/core/utils/firebase-collections'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

type Platforms = 'META' | 'EMAIL MARKETING' | ''

interface Timestamp {
  seconds: number
  nanoseconds: number
}

interface ProjectData {
  pj_id: string
  uid: string
  name: string
  platform: Platforms
  account: string
  status: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

interface Project {
  data: ProjectData | null
  list: ProjectData[]
  isInitialized: boolean
  initialize: () => void
  get: (id: string) => Promise<ProjectReturnData>
  getWhere: (
    fieldName: keyof ProjectData,
    operator:
      | '=='
      | '!='
      | '<'
      | '<='
      | '>'
      | '>='
      | 'array-contains'
      | 'array-contains-any'
      | 'in'
      | 'not-in',
    fieldValue: any,
  ) => Promise<ProjectReturnList>
  createUpdate: (type: 'new' | 'update') => Promise<ProjectReturnData>
  set: (data: ProjectData) => ProjectData
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
  const project_data = reactive<Project>({
    data: null,
    list: [],
    isInitialized: false,
    initialize() {
      if (!this.isInitialized) {
        this.data = {
          pj_id: '',
          account: '',
          uid: '',
          name: '',
          platform: '',

          status: '',
          createdAt: '',
          updatedAt: '',
        }
        this.isInitialized = true
      }
    },
    async get(id: string) {
      const get = await getCollection('projects', 'pj_id', id)
      return {
        status: get.status,
        data: get.data as ProjectData,
        error: get.error,
      }
    },
    async getWhere(fieldName, operator, fieldValue) {
      const get = await getCollectionByField('projects', 'pj_id', fieldName, operator, fieldValue)
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
  })

  return {
    project_data,
  }
})

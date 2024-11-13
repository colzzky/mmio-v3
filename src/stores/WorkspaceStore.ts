import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes'
import type { DocumentData } from 'firebase/firestore'
import { useAuthStore } from './authStore'
import { reactive } from 'vue'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import { defineStore } from 'pinia'

interface Workspace {
  data: WorkspaceData
  reInit: () => void
  set: (data: WorkspaceData) => void
  get: (ws_id: string) => Promise<WorkspaceDataReturnData>
  createUpdate: (type: 'new' | 'update') => Promise<WorkspaceDataReturnData>
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

export const useWorkspaceStore = defineStore('workspaceStore', () => {
  const workspace = <Workspace>({
    data: { ...workspace_data },
    reInit() {
      this.data = { ...workspace_data }
    },
    set(data: WorkspaceData) {
      this.data = data
    },
    async get(ws_id: string): Promise<WorkspaceDataReturnData> {
      const get = await getCollection('workspaces', 'workspaces', {}, ws_id, [])
      return {
        status: get.status,
        data: get.data as WorkspaceData,
        error: get.error,
      }
    },
    async createUpdate(type): Promise<WorkspaceDataReturnData> {
      const id = this.data.ws_id !== '' ? this.data.ws_id : crypto.randomUUID();
      this.data.ws_id = id
      const post = await postCollection('workspaces', 'workspaces', null, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as WorkspaceData,
        error: post.error,
      }
    },
  })

  const reset_state = () => {
    //workspace.resetData()
  }

  return {
    workspace,
    reset_state
  }
})

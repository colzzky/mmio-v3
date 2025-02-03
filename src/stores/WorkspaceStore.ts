import {
  workspace_data,
  ws_meta_pages_refs_data,
  type WorkspaceData,
  type WSMetaPagesRefsData,
} from '@/core/types/WorkSpaceTypes'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type FSReturnData<T> = FirebaseReturnBase & {
  data: T
}

interface Workspace {
  data: WorkspaceData
  reInit: () => void
  set: (data: WorkspaceData) => void
}
interface WsMetaPagesRefs {
  data: WSMetaPagesRefsData
  reInit: () => void
  set: (data: WSMetaPagesRefsData) => void
}

export const useWorkspaceStore = defineStore('workspaceStore', () => {
  const workspace = reactive<Workspace>({
    data: { ...workspace_data },
    reInit() {
      this.data = { ...workspace_data }
    },
    set(data: WorkspaceData) {
      this.data = data
    },
    // async get(ws_id: string): Promise<FSReturnData<WorkspaceData>> {
    //   const get = await getCollection('workspaces', {
    //     $path: 'workspaces',
    //     id: ws_id,
    //     $sub_col: ['meta_pages_refs'],
    //   })
    //   return {
    //     status: get.status,
    //     data: get.data as WorkspaceData,
    //     error: get.error,
    //   }
    // },
    // async createUpdate(type): Promise<FSReturnData<WorkspaceData>> {
    //   const id = this.data.ws_id !== '' ? this.data.ws_id : crypto.randomUUID()
    //   this.data.ws_id = id
    //   const post = await postCollection('workspaces', {
    //     $path: 'workspaces',
    //     $sub_params: null,
    //     id,
    //     data: this.data,
    //     type,
    //   })
    //   console.log(post)
    //   return {
    //     status: post.status,
    //     data: post.data as WorkspaceData,
    //     error: post.error,
    //   }
    // },
  })

  const workspace_meta_pages_refs = reactive<WsMetaPagesRefs>({
    data: { ...ws_meta_pages_refs_data },
    reInit() {
      this.data = { ...ws_meta_pages_refs_data }
    },
    set(data: WSMetaPagesRefsData) {
      this.data = data
    },
    // async get(mp_id, ws_id): Promise<FSReturnData<WSMetaPagesRefsData>> {
    //   const get = await getCollection('ws_meta_pages_refs', {
    //     $path: 'workspaces/:ws_id/meta_pages_refs',
    //     $sub_params: { ws_id },
    //     id: mp_id,
    //   })
    //   return {
    //     status: get.status,
    //     data: get.data as WSMetaPagesRefsData,
    //     error: get.error,
    //   }
    // },
    // async createUpdate(ws_id, type): Promise<FSReturnData<WSMetaPagesRefsData>> {
    //   const id = this.data.mp_id !== '' ? this.data.mp_id : crypto.randomUUID()
    //   this.data.mp_id = id
    //   const post = await postCollection('ws_meta_pages_refs', {
    //     $path: 'workspaces/:ws_id/meta_pages_refs',
    //     $sub_params: { ws_id },
    //     id,
    //     data: this.data,
    //     type,
    //   })
    //   console.log(post)
    //   return {
    //     status: post.status,
    //     data: post.data as WSMetaPagesRefsData,
    //     error: post.error,
    //   }
    // },
  })

  const reset_state = () => {
    //workspace.resetData()
  }

  return {
    workspace,
    reset_state,
    workspace_meta_pages_refs,
  }
})

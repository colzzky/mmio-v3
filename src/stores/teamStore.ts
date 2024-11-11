import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes'
import type { DocumentData } from 'firebase/firestore'
import { useAuthStore } from './authStore'
import { reactive } from 'vue'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import { defineStore } from 'pinia'
import { team_data, type TeamData } from '@/core/types/TeamTypes'

interface Team {
  data: TeamData
  reInit: () => void
  set: (data: TeamData) => void
  get: (ws_id: string) => Promise<TeamReturnData>
  createUpdate: (type: 'new' | 'update') => Promise<TeamReturnData>
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type TeamReturnData = FirebaseReturnBase & {
  data: TeamData
}

export const useTeamStore = defineStore('teamStore', () => {
  const team = <Team>({
    data: { ...team_data },
    reInit() {
      this.data = { ...team_data }
      //this is team
    },
    set(data: TeamData) {
      this.data = data
    },
    async get(ws_id: string): Promise<TeamReturnData> {
      const get = await getCollection('workspaces', 'workspaces', {}, ws_id, [])
      return {
        status: get.status,
        data: get.data as TeamData,
        error: get.error,
      }
    },
    async createUpdate(type): Promise<TeamReturnData> {
      let id = this.data.tm_id !== '' ? this.data.tm_id : crypto.randomUUID();
      this.data.tm_id = id
      const post = await postCollection('workspaces', 'workspaces', null, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as TeamData,
        error: post.error,
      }
    },
  })

  const reset_state = () => {
    //workspace.resetData()
  }

  return {
    reset_state
  }
})

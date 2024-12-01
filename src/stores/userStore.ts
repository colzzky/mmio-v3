import type { TeamRefsData } from '@/core/types/AuthUserTypes'
import { team_refs_data } from '@/core/types/AuthUserTypes'
import { postCollection, getCollection } from '@/core/utils/firebase-collections'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

//Please read use this only for Referencing user when logged in by a different user

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type FSReturnData<T> = FirebaseReturnBase & {
  data: T
}

interface TeamRefs {
  data: TeamRefsData
  reInit: () => void
  set: (data: TeamRefsData) => void
  get: (ws_id: string) => Promise<FSReturnData<TeamRefsData>>
  createUpdate: (uid: string, type: 'new' | 'update') => Promise<FSReturnData<TeamRefsData>>
}

export const useUserStore = defineStore(
  'userStore',
  () => {
    const user_team_refs = reactive<TeamRefs>({
      data: { ...team_refs_data },
      reInit() {
        this.data = { ...team_refs_data }
        //this is team
      },
      set(data: TeamRefsData) {
        this.data = data
      },
      async get(tm_id: string): Promise<FSReturnData<TeamRefsData>> {
        const get = await getCollection('team',{
          $path: 'teams',
          $sub_params:{ tm_id: tm_id },
          id:tm_id,
        })
        return {
          status: get.status,
          data: get.data as TeamRefsData,
          error: get.error,
        }
      },
      async createUpdate(uid: string, type): Promise<FSReturnData<TeamRefsData>> {
        const id = this.data.team_refs_id !== '' ? this.data.team_refs_id : crypto.randomUUID()
        this.data.team_refs_id = id

        const post = await postCollection('team_refs',{
          $path: 'users/:uid/team_refs',
          $sub_params: { uid},
          id,
          data: this.data,
          type,
        });
      
        console.log(post)
        return {
          status: post.status,
          data: post.data as TeamRefsData,
          error: post.error,
        }
      },
    })

    async function setTeamReference(tm_id: string, uid: string): Promise<boolean> {
      user_team_refs.reInit()
      user_team_refs.data.tm_id = tm_id
      const post = await user_team_refs.createUpdate(uid, 'new')
      if (post.status) {
        return true
      }
      return false
    }

    return {
      user_team_refs,
      setTeamReference,
    }
  },
  {},
)

import type { TeamData, TeamMembersData } from '@/core/types/TeamTypes'
import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes'
import { firestore } from '@/core/utils/firebase-client'
import { listenToCollection } from '@/core/utils/firebase-collections'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

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
    returnHome
  }
},
  {
    persist: {
      
    }
  }
)

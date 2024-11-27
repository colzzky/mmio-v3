import type { MetaPageData } from '@/core/types/MetaTypes'
import type { TeamData, TeamMembersData } from '@/core/types/TeamTypes'
import { workspace_data, type WorkspaceData, type WSMetaPagesRefsData } from '@/core/types/WorkSpaceTypes'
import { getWhereAny, listenToCollection } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
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

  const current_meta_pages = reactive({
    data: <MetaPageData[]>[],
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
      console.log(active_workspace.data)
      if (this.checkNextFetch()) {
        this.isLoading = true
        const work_page_ids: string[] = []
        if (active_workspace.data && active_workspace.data.meta_pages_refs) {
          active_workspace.data.meta_pages_refs.forEach(wp => {
            work_page_ids.push(wp.mp_id)  
          })
          
          const fetch_meta_pages = await getWhereAny('meta_page', 'meta_pages', {}, [], [{
            fieldName: 'mp_id', operator: 'in', value: work_page_ids
          }])
          if (fetch_meta_pages.status) {
            this.data = fetch_meta_pages.data
          }
        }
        this.generateNextFetch()
        this.isLoading = false
        this.isInitialized = true
      }
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
    current_meta_pages,
    
    returnHome
  }
},
)

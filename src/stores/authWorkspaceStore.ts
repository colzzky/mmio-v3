import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes'
import { defineStore } from 'pinia'

interface AuthWorkspace {
  data: WorkspaceData
}


export const useAuthWorkspaceStore = defineStore('authWorkspaceStore', () => {
  const auth_workspace = <AuthWorkspace>({
    data: { ...workspace_data }
  })

  
  const reset_state = () => {
    //workspace.resetData()
  }

  return {

  }
})

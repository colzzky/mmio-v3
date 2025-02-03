import type { PlatformApiData, TeamRefsData } from './AuthUserTypes'
import type { SubCollections } from '@/core/types/UniTypes'
import type {
  UserData,
  WorkspaceData,
  MetaPageData,
  InvitationData,
  TeamData,
  TeamMembersData,
  PermissionData,
  TeamWorkspaceRefsData,
  WSMetaPagesRefsData,
  ChatbotFlowServiceData,
  PostRandomizerServiceData,
  PostRandomizerPostsData,
} from '@/core/utils/types'
import type { DbCollections } from '../utils/enums/dbCollection'
import type { DocumentData } from 'firebase/firestore'

export type SubCollectionKey<T extends SubCollections> = T['subCollections']
export interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
export type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
export type FSReturnData<T> = FirebaseReturnBase & {
  data: T
}
export type SubParams = Record<string, string> | null

interface Workspace_Collection {
  [DbCollections.workspaces]: {
    id: 'ws_id'
    interface: WorkspaceData
    subCollections: ([DbCollections.ws_meta_pages_refs] | [DbCollections.ws_chatbot_flow] |[ DbCollections.ws_post_randomizer])[]
    sub_params: {} 
  }
  [DbCollections.ws_meta_pages_refs]: {
    id: 'mp_id'
    interface: WSMetaPagesRefsData
    subCollections: []
    sub_params: {
      ws_id: string
    } 
  }
  [DbCollections.ws_chatbot_flow]: {
    id: 'cb_id'
    interface: ChatbotFlowServiceData
    subCollections: []
    sub_params: {
      ws_id: string
    } 
  }
  [DbCollections.ws_post_randomizer]: {
    id: 'pr_id'
    interface: PostRandomizerServiceData
    subCollections: ([DbCollections.ws_post_randomizer_posts])[]
    sub_params: {
      ws_id: string
    } 
  }
  [DbCollections.ws_post_randomizer_posts]: {
    id: 'prp_id'
    interface: PostRandomizerPostsData
    subCollections: []
    sub_params: {
      ws_id: string
      pr_id: string
    } 
  }
}

interface User_Collection {
  [DbCollections.users]: {
    id: 'up_id'
    interface: UserData
    subCollections: ([DbCollections.platform_apis] | [DbCollections.team_refs])[]
    sub_params: {} 
  }

  [DbCollections.platform_apis]: {
    id: 'platform'
    interface: PlatformApiData
    subCollections:[]
    sub_params: {
      uid: string
    } 
  }

  [DbCollections.team_refs]: {
    id: 'team_refs'
    interface: TeamRefsData
    subCollections:[]
    sub_params: {
      uid: string
    } 
  }
}

interface Team_Collection {
  [DbCollections.teams]: {
    id: 'tm_id'
    interface: TeamData
    subCollections: ([DbCollections.team_members] | [DbCollections.team_workspace_refs])[]
    sub_params: {} 
  }
  [DbCollections.team_members]: {
    id: 'member_id'
    interface: TeamMembersData
    subCollections:[]
    sub_params: {
      tm_id: string
    } 
  }
  [DbCollections.team_workspace_refs]: {
    id: 'workspace_id'
    interface: TeamWorkspaceRefsData
    subCollections:[]
    sub_params: {
      tm_id: string
    } 
  }
}

export type CollectionsInterface = {
  [DbCollections.meta_pages]: {
    id: 'mp_id'
    interface: MetaPageData
    subCollections:[]
    sub_params: {} 
  }

  [DbCollections.invitations]: {
    id: 'iv_id'
    interface: InvitationData
    subCollections: []
    sub_params: {} 
  }
  [DbCollections.permissions]: {
    id: 'permission_id'
    interface: PermissionData
    subCollections: [],
    sub_params: {} 
  }
} & Workspace_Collection &
  User_Collection &
  Team_Collection

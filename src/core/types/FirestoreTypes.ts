import type { SubCollections } from '@/core/types/UniTypes'
import type {
  UserData,
  WorkspaceData,
  MetaPageData,
  ChatBotFlowData,
  TeamData,
} from '@/core/utils/types'
import type { PlatformApiData, TeamRefsData } from './AuthUserTypes'

export type SubCollectionKey<T extends SubCollections> = T['subCollections']

interface Workspace_Collection {
  workspaces: {
    id: 'ws_id'
    path: 'workspaces'
    interface: WorkspaceData
    sub_col: SubCollectionKey<WorkspaceData>[]
    sub_params: {} | null
  }
}

interface User_Collection {
  user: {
    id: 'up_id'
    path: 'users'
    interface: UserData
    sub_col: SubCollectionKey<UserData>[]
    sub_params: {} | null
  }

  platform_api: {
    id: 'platform'
    path: 'users/:uid/platform_apis'
    interface: PlatformApiData
    sub_col: SubCollectionKey<PlatformApiData>[]
    sub_params: {
      uid:string
    } | null
  }

  team_refs: {
    id: 'team_refs'
    path: 'users/:uid/team_refs'
    interface: TeamRefsData
    sub_col: SubCollectionKey<TeamRefsData>[]
    sub_params: {
      uid:string
    } | null
  }
}

export type CollectionsInterface = {
  meta_page: {
    id: 'mp_id'
    path: 'meta_pages'
    interface: MetaPageData
    sub_col: SubCollectionKey<MetaPageData>[]
    sub_params: {} | null
  }
  team:{
    id: 'tm_id'
    path: 'teams'
    interface: TeamData
    sub_col: SubCollectionKey<TeamData>[]
    sub_params: {} | null
  }
  // chat_bot_flow: {
  //   id: 'cb_id'
  //   path: 'chat_bot_flow'
  //   interface: ChatBotFlowData
  //   sub_col: SubCollectionKey<ChatBotFlowData>[]
  //   sub_params: {} | null
  // }
} & Workspace_Collection & User_Collection

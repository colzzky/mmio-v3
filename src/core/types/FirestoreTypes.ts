import type { SubCollections } from '@/core/types/UniTypes'
import type { Shared } from '@/core/types/WorkSpaceTypes'
import type {
  UserData,
  WorkspaceData,
  MetaPageData,
  ChatBotFlowData,
} from '@/core/utils/types'
import type { PlatformApiData } from './AuthUserTypes'

export type SubCollectionKey<T extends SubCollections> = T['subCollections']

interface Workspace_Collection {
  workspaces: {
    id: 'ws_id'
    path: 'workspaces'
    interface: WorkspaceData
    sub_col: SubCollectionKey<WorkspaceData>[]
    sub_params: {} | null
  }

  workspaces_share: {
    id: 'share_id'
    path: 'workspaces/:ws_id/share/'
    interface: Shared
    sub_col: SubCollectionKey<Shared>[]
    sub_params: {
      ws_id: string
    } | null
  }

  workspaces_share_comment: {
    id: 'comment_id'
    path: 'workspaces/:ws_id/share/:share_id/comment'
    interface: WorkspaceData
    sub_col: SubCollectionKey<WorkspaceData>[]
    sub_params: {
      ws_id: string
      share_id: string
    } | null
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
}

export type CollectionsInterface2 = {
  meta_page: {
    id: 'mp_id'
    path: 'meta_pages'
    interface: MetaPageData
    sub_col: SubCollectionKey<MetaPageData>[]
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

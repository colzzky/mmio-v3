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

export type SubCollectionKey<T extends SubCollections> = T['subCollections']

interface Workspace_Collection {
  workspaces: {
    id: 'ws_id'
    path: 'workspaces'
    interface: WorkspaceData
    sub_col: SubCollectionKey<WorkspaceData>[]
    sub_params: {} | null
  }
  ws_meta_pages_refs: {
    id: 'mp_id'
    path: 'workspaces/:ws_id/meta_pages_refs'
    interface: WSMetaPagesRefsData
    sub_col: SubCollectionKey<WSMetaPagesRefsData>[]
    sub_params: {
      ws_id: string
    } | null
  }
  ws_chatbot_flow: {
    id: 'cb_id'
    path: 'workspaces/:ws_id/chatbot_flow_service'
    interface: ChatbotFlowServiceData
    sub_col: SubCollectionKey<ChatbotFlowServiceData>[]
    sub_params: {
      ws_id: string
    } | null
  }
  ws_post_randomizer: {
    id: 'pr_id'
    path: 'workspaces/:ws_id/post_randomizer_service'
    interface: PostRandomizerServiceData
    sub_col: SubCollectionKey<PostRandomizerServiceData>[]
    sub_params: {
      ws_id: string
    } | null
  }
  ws_post_randomizer_posts: {
    id: 'prp_id'
    path: 'workspaces/:ws_id/post_randomizer_service/:pr_id/post_randomizer_posts'
    interface: PostRandomizerPostsData
    sub_col: SubCollectionKey<PostRandomizerServiceData>[]
    sub_params: {
      ws_id: string
      pr_id: string
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
      uid: string
    } | null
  }

  team_refs: {
    id: 'team_refs'
    path: 'users/:uid/team_refs'
    interface: TeamRefsData
    sub_col: SubCollectionKey<TeamRefsData>[]
    sub_params: {
      uid: string
    } | null
  }
}

interface Team_Collection {
  team: {
    id: 'tm_id'
    path: 'teams'
    interface: TeamData
    sub_col: SubCollectionKey<TeamData>[]
    sub_params: {} | null
  }
  team_members: {
    id: 'member_id'
    path: 'teams/:tm_id/team_members'
    interface: TeamMembersData
    sub_col: SubCollectionKey<TeamMembersData>[]
    sub_params: {
      tm_id: string
    } | null
  }
  team_workspace_refs: {
    id: 'workspace_id'
    path: 'teams/:tm_id/team_workspace_refs'
    interface: TeamWorkspaceRefsData
    sub_col: SubCollectionKey<TeamWorkspaceRefsData>[]
    sub_params: {
      tm_id: string
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

  invitation: {
    id: 'iv_id'
    path: 'invitations'
    interface: InvitationData
    sub_col: SubCollectionKey<InvitationData>[]
    sub_params: {} | null
  }
  permission: {
    id: 'permission_id'
    path: 'permissions'
    interface: PermissionData
    sub_col: SubCollectionKey<PermissionData>[]
    sub_params: {} | null
  }
  // chat_bot_flow: {
  //   id: 'cb_id'
  //   path: 'chat_bot_flow'
  //   interface: ChatBotFlowData
  //   sub_col: SubCollectionKey<ChatBotFlowData>[]
  //   sub_params: {} | null
  // }
} & Workspace_Collection &
  User_Collection &
  Team_Collection

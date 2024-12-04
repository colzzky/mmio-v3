import type { UserData } from './AuthUserTypes'
import type { TeamData, TeamMembersData } from './TeamTypes'
import type {
  ChatbotFlowServiceData,
  PostRandomizerPostsData,
  PostRandomizerServiceData,
  WorkspaceData,
} from './WorkSpaceTypes'
import type { DocumentData } from 'firebase/firestore'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type FSReturnData<T> = FirebaseReturnBase & {
  data: T
}

interface MembersInfo extends TeamMembersData {
  displayName:string,
  email:string,
  picture:string,
}

interface ActiveWorkspace {
  data: WorkspaceData | null
  isInitialized: boolean
  isLoading: boolean
  reset: () => void
}

interface ActiveTeam {
  data: TeamData | null
  members: { [key: TeamMembersData['uid']]: MembersInfo}
  isInitialized: boolean
  isLoading: boolean
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
interface ChatBotFlowService {
  data: ChatbotFlowServiceData
  reInit: () => void
  set: (data: ChatbotFlowServiceData) => void
  get: (cb_id: string) => Promise<FSReturnData<ChatbotFlowServiceData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<ChatbotFlowServiceData>>
}

interface PostRandomizerService {
  data: PostRandomizerServiceData
  reInit: () => void
  set: (data: PostRandomizerServiceData) => void
  get: (pr_id: string) => Promise<FSReturnData<PostRandomizerServiceData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<PostRandomizerServiceData>>
}

interface PostRandomizerPosts {
  data: PostRandomizerPostsData
  reInit: () => void
  set: (data: PostRandomizerPostsData) => void
  get: (pr_id: string, prp_id:string) => Promise<FSReturnData<PostRandomizerPostsData>>
  createUpdate: (pr_id: string, type: 'new' | 'update') => Promise<FSReturnData<PostRandomizerPostsData>>
}

export type {
  FirebaseReturn,
  FirebaseReturnBase,
  FSReturnData,
  ActiveWorkspace,
  ActiveTeam,
  CurrentMember,
  ChatBotFlowService,
  PostRandomizerService,
  PostRandomizerPosts,
  MembersInfo
}

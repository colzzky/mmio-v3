import type { TeamData, TeamMembersData } from './TeamTypes'
import type {
  ChatbotFlowServiceData,
  MetaPageRefs,
  PostRandomizerPostsData,
  PostRandomizerServiceData,
  WorkspaceData,
  WSMetaPagesRefsData,
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
  displayName: string
  email: string
  picture: string
}

interface ActiveWorkspace {
  data: WorkspaceData | null
  meta_page_refs:WSMetaPagesRefsData[]
  isInitialized: boolean
  isLoading: boolean
  reset: () => void
}

interface ActiveTeam {
  data: {'team': TeamData, 'members': TeamMembersData[]} | null
  members: { [key: TeamMembersData['uid']]: MembersInfo }
  isInitialized: boolean
  isLoading: boolean
  reset: () => void
}
interface CurrentMember {
  data: TeamMembersData | null
  isOwner: boolean
  isInitialized: boolean
  isLoading: boolean
  listener: (() => void) | null;
  reset: () => void
  listen: (tm_id: string, member_id: string) => Promise<void>
}
interface ChatBotFlowService {
  data: ChatbotFlowServiceData
  reInit: () => void
  set: (data: ChatbotFlowServiceData) => void
}

interface PostRandomizerService {
  data: PostRandomizerServiceData
  reInit: () => void
  set: (data: PostRandomizerServiceData) => void
}

interface PostRandomizerPosts {
  data: PostRandomizerPostsData
  reInit: () => void
  set: (data: PostRandomizerPostsData) => void
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
  MembersInfo,
}

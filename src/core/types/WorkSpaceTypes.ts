import type { Days, Months, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface WorkspaceData extends SubCollections {
  ws_id: string
  name: string
  owner_uid: string
  status: string
  createdAt: string
  updatedAt: string
  team_id: string
  meta_pages_refs?: WSMetaPagesRefsData[]
  subCollections: 'meta_pages_refs'[]
}
export interface WSMetaPagesRefsData extends SubCollections {
  mp_id: string //same as the meta pages id
  imported_by_uid: string
  createdAt: string
  updatedAt: string
}
export interface MetaPageRefs {
  mp_id: string
  image: string
  imported_by: string
  page_name: string
  importedAt: string
  updatedAt: string
}

export const workspace_data: WorkspaceData = {
  ws_id: '',
  name: '',
  owner_uid: '',
  team_id: '',
  status: 'Active',
  createdAt: '',
  updatedAt: '',
  subCollections: ['meta_pages_refs'],
}

export const ws_meta_pages_refs_data: WSMetaPagesRefsData = {
  mp_id: '',
  imported_by_uid: '',
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}

//Meta Services
export interface ChatbotFlowServiceData extends SubCollections {
  cb_id: string
  connected_account_id: string //meta pages id
  name: string
  botFlow: string // This is where flow data is needed
  status: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}
export const chatbot_flow_service_Data: ChatbotFlowServiceData = {
  cb_id: '',
  name: '',
  connected_account_id: '', //meta pages id
  botFlow: '', // This is where flow data is needed
  status: '',
  isEnabled: false,
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}
export interface PostRandomizerServiceData extends SubCollections {
  pr_id: string
  metaPages: string[]
  metaGroups: string[]
  igAccounts: string[]
  name: string
  isEnabled: boolean
  timezone: string
  status: string
  time: string[]
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  weekly: Days[]
  monthly: Months[]
  isRepeat: boolean
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  subCollections: 'post_randomizer_posts'[]
}

export const post_randomizer_service_data: PostRandomizerServiceData = {
  pr_id: '',
  metaPages: [],
  metaGroups: [],
  igAccounts: [],
  name: '',
  status: '',
  timezone: '',
  isEnabled: false,
  isRepeat: false,
  frequency: 'Daily',
  time: [],
  startDate: '',
  endDate: '',
  weekly: [],
  monthly: [],
  createdAt: '',
  updatedAt: '',
  subCollections: ['post_randomizer_posts'],
}

export interface PostRandomizerPostsData extends SubCollections {
  prp_id: string
  postName: string
  mediaSource: string[] //location of media
  createdBy: string //location of media
  content: string
  createdAt: string
  updatedAt: string
}

export const post_randomizer_posts_data: PostRandomizerPostsData = {
  prp_id: '',
  postName: '',
  content: '',
  mediaSource: [],
  createdBy: '',
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}

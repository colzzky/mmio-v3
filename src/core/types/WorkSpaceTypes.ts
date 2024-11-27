import type { Timestamp, SubCollections } from './UniTypes'

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
  subCollections: ('meta_pages_refs')[]
}
export interface WSMetaPagesRefsData extends SubCollections {
  mp_id: string //same as the meta pages id
  imported_by_uid: string
  createdAt: string
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
  subCollections: ['meta_pages_refs']
}

export const ws_meta_pages_refs_data: WSMetaPagesRefsData = {
  mp_id: '',
  imported_by_uid:'',
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}



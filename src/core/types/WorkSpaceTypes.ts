import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface WorkspaceData extends SubCollections {
  ws_id: string,
  owner_uid: string,
  status: string,
  createdAt: string,
  updatedAt: string
}

export const workspace_data:WorkspaceData = {
  ws_id: '',
  owner_uid: '',
  status: 'Active',
  createdAt: '',
  updatedAt: '',
  subCollections: []
}


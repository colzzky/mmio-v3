import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface WorkspaceData extends SubCollections {
  ws_id: string,
  name: string,
  owner_uid: string,
  status: string,
  createdAt: string,
  updatedAt: string,
  team_id:string,
}

export const workspace_data:WorkspaceData = {
  ws_id: '',
  name: '',
  owner_uid: '',
  team_id:'',
  status: 'Active',
  createdAt: '',
  updatedAt: '',
  subCollections: []
}


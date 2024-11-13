import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface TeamData extends SubCollections {
  tm_id: string
  name: string
  owner_uid: string
  members:
    | [
        {
          uid: string
          role: string
          isDisabled: boolean
        },
      ]
    | []
  createdAt: string
  updatedAt: string
}

export const team_data: TeamData = {
  tm_id: '',
  name: '',
  owner_uid: '',
  members: [],
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}

import type { MetaPagesData } from './MetaTypes'
import type { Timestamp, SubCollections } from './UniTypes'

export type Platforms =
  | 'Meta'
  | 'Email-Marketing'
  | 'Google-My-Business'
  | 'Whatsapp'
  | 'SMS-Marketing'
  | 'E-Commerce'
  | 'OmniChannel'
  | ''

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface WorkspaceData extends SubCollections {
  ws_id: string
  uid: string
  name: string
  platform: Platforms
  account_id: string // Connected page email marketing etc id
  connectedAccount: MetaPagesData | null
  shared_uids: string[]
  status: string
  createdAt: string
  updatedAt: string
  updatedBy: string
  subCollections: 'shared'[]
  shared: Shared[]
}

export interface Shared extends SubCollections {
  share_id: string
  sharee_uid: string
  access: boolean
}


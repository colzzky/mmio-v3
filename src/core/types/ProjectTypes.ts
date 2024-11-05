import type { MetaPagesData } from './MetaTypes'

export type Platforms =
  | 'META'
  | 'Email-Marketing'
  | 'Google-My-Business'
  | 'Whatsapp'
  | 'SMS-Marketing'
  | 'E-Commerce'
  | 'OmniChannel'
  | ''

export interface ProjectData {
  pj_id: string
  uid: string
  name: string
  platform: Platforms
  account_id: string // Connected page email marketing etc id
  connectedAccount: MetaPagesData | null
  shared_uids: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface SharedProjectData {
  sp_id: string
  pj_id: string
  sharer_id: string
  sharee_uid: string[]
  access: boolean
  createdAt: string
  updatedAt: string
}

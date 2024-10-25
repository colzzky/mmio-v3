import type { MetaPagesData } from './MetaTypes'
import type { Timestamp } from './UniTypes'

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
  connectedAccount: MetaPagesData|null
  status: string
  createdAt:string
  updatedAt:string
}

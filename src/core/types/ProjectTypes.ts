import type {Timestamp} from './UniTypes'

export type Platforms = 'META' | 'EMAIL MARKETING' | ''

export interface ProjectData {
  pj_id: string
  uid: string
  name: string
  platform: Platforms
  account: string
  status: string
  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

import type {Timestamp} from './UniTypes'

export type Platforms = 'META'| 'Email-Marketing'| 'Google-My-Business'| 'Whatsapp'| 'SMS-Marketing'| 'E-Commerce'| 'OmniChannel'

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

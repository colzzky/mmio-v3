import type { MetaPictureReturn } from './MetaTypes'
import type { SubCollections } from './UniTypes'
import type { Timestamp } from 'firebase/firestore'

export interface EmailMarketingAPIAccount {
  client_id: string
  email: string
  name: string
  accessToken: string
  expiresIn: number
  machind_id: string
  client_id: string
  email: string
  name: string
  accessToken: string
  expiresIn: number
  machind_id: string
}
export interface MetaAPIAccount {
  client_id: string
  email: string
  name: string
  picture?: MetaPictureReturn
  accessToken: string
  expiresIn: number
  machind_id: string
  client_id: string
  email: string
  name: string
  picture?: MetaPictureReturn
  accessToken: string
  expiresIn: number
  machind_id: string
}
export interface MetaAccount {
  id: string
  email: string
  name: string
  picture?: {
    data: {
      is_silhouette: boolean
      url: string
      width: number
      height: number
    }
  }
  id: string
  email: string
  name: string
  picture?: {
    data: {
      is_silhouette: boolean
      url: string
      width: number
      height: number
    }
  }
}

export interface MetaPages {
  mp_id: string
  pa_id: string
  page_id: string
  category: string
  access_token: string
  expiresIn: string
  tasks: string[]
  status: boolean
  inAutomation: boolean
  mp_id: string
  pa_id: string
  page_id: string
  category: string
  access_token: string
  expiresIn: string
  tasks: string[]
  status: boolean
  inAutomation: boolean
}

export interface EmailMarketinPages {
  mp_id: string
  pa_id: string
  page_id: string
  category: string
  access_token: string
  expiresIn: string
  tasks: string[]
  mp_id: string
  pa_id: string
  page_id: string
  category: string
  access_token: string
  expiresIn: string
  tasks: string[]
}

export interface FBLonglivedCodeReturn {
  access_token: string
  expires_in: number
  machine_id: string
  access_token: string
  expires_in: number
  machine_id: string
}

export interface PlatformApiData extends SubCollections {
  pa_id: string
  uid: string
  platform: string
  api_account: MetaAPIAccount | EmailMarketingAPIAccount | null //This is a json stringify object like MetaAccount
  createdAt: string
  updatedAt: string
}


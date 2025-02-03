import type { MetaPictureReturn } from './MetaTypes'
import type {MutablePick } from './UniTypes'
import type { User } from 'firebase/auth'

export interface UserAddress {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  contactEmail: string
}

export interface UserData extends MutablePick<User, 'displayName' | 'email' | 'photoURL' | 'uid' | 'emailVerified'> {
  uid: string
  profile: UserProfile
  address: UserAddress
  createdAt: string
  updatedAt: string
}

export const user_data: UserData = {
  uid: '',
  profile: {
    firstName: '',
    lastName: '',
    contactEmail: '',
  },
  address: {
    city: '',
    state: '',
    country: '',
    street: '',
    zipCode: '',
  },
  displayName: '',
  email: '',
  emailVerified: true,
  photoURL: '',
  createdAt: '',
  updatedAt: '',
}

export interface PlatformApiData {
  platform: 'Meta' | ''
  client_account: MetaAPIAccount | null
  createdAt: string
  updatedAt: string
}

export const platform_api_data: PlatformApiData = {
  platform: '',
  client_account: null,
  createdAt: '',
  updatedAt: '',
}

///////////////////
//Team Reference//
//////////////////

export interface TeamRefsData {
  team_refs_id: string
  tm_id: string
  createdAt: string
  updatedAt: string
}

export const team_refs_data: TeamRefsData = {
  team_refs_id: '',
  tm_id: '',
  createdAt: '',
  updatedAt: '',
}

///////////////////
//META API Model//
//////////////////
export interface MetaAPIAccount {
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
}

export interface MetaLonglivedCodeReturn {
  access_token: string
  expires_in: number
  machine_id: string
}

export interface MetaAPIAccount {
  client_id: string
  email: string
  name: string
  picture?: MetaPictureReturn
  accessToken: string
  expiresIn: number
  machind_id: string
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
}

export interface FBLonglivedCodeReturn {
  access_token: string
  expires_in: number
  machine_id: string
}

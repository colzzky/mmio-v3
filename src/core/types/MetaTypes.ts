import type { SubCollections } from './UniTypes'
import type { Timestamp } from 'firebase/firestore'

export interface MetaPagesReturn {
  access_token: string
  category: string
  category_list: { id: string; name: string }[]
  name: string
  id: string
  tasks: string[]
}

export interface MetaPictureReturn {
  data: {
    is_silhouette: boolean
    url: string
    width: number
    height: number
  }
}

export interface MetaPageData extends SubCollections {
  mp_id: string
  page_id: string
  owner_uid: string
  access_token: string
  picture?: MetaPictureReturn
  category: string
  name: string
  isActive: boolean
  voided: boolean
  isOnProject: boolean
  createdAt: string
  updatedAt: string
}

export const meta_page_data: MetaPageData = {
  mp_id: '',
  page_id: '',
  owner_uid: '',
  access_token: '',
  category: '',
  name: '',
  isActive: false,
  voided: false,
  isOnProject: false,
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}

/** Meta Services */

export interface ChatBotFlowData extends SubCollections {
  cb_id: string
  pj_id: string // Meta_page_id
  name: string
  dataFlow: string // This is where flow data is needed
  status: string
  isEnabled: string
  createdAt: string
  updatedAt: string
}

/** Meta Services */

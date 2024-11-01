import type { MetaPagesData } from './MetaTypes'
import type { Timestamp, SubCollections } from './UniTypes'

export type Platforms =
  | 'META'
  | 'Email-Marketing'
  | 'Google-My-Business'
  | 'Whatsapp'
  | 'SMS-Marketing'
  | 'E-Commerce'
  | 'OmniChannel'
  | ''



export interface WorkspaceDataSub  {
  subCollection1:SubCollection1
  subCollection2:SubCollection2
}
export type NewType<T extends SubCollections> = T['subCollections'];

export type SubCollection<T> = {
  id: string; // Unique identifier for the subcollection
  path: string; // Path to access the subcollection
  interface: T; // Interface type for the subcollection data
  sub_col: (keyof T)[]; // Array of valid subcollection keys for type safety
};

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
  subCollections:('shared')[]

  sub:{
    shared:SubCollection<Shared>[]
  }
}

export interface Shared extends SubCollections {
  share_id:string,
  sharee_uid:string
  access:boolean
}


export interface SubCollection1Sub  {
  subCollection1_1:SubCollection1_1
}

export interface SubCollection1 {
  sc1_id: string
  name: string
  subCollections:keyof SubCollection1Sub[]
  createdAt: string
  updatedAt: string
  subCollection1_1:SubCollection1_1
}

export interface SubCollection1_1 {
  sc1_1_id: string
  name: string
  createdAt: string
  updatedAt: string
}




export interface SubCollection2Sub  {
  subCollection2_1:SubCollection2_1
}

export interface SubCollection2 {
  sc2_id: string
  name: string
  createdAt: string
  updatedAt: string
  subCollections:keyof SubCollection2Sub[]
}



export interface SubCollection2_1 {
  sc2_1_id: string
  name: string
  createdAt: string
  updatedAt: string
}


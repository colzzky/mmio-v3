import type { Timestamp, SubCollections } from './UniTypes'

//Change everything here
//Add more permission type here if needed
export const PermissionTypes = ['view', 'add', 'edit', 'delete', 'clone', 'publish'] as const
export type TypeOfPermissionType = (typeof PermissionTypes[number])

//Add More Services here if needed
export enum PermissionServices {
  ChatBotFlow = 'Chatbot Flow',
  CommentAutoReply = 'Comment Auto Reply',
  EmailMarketing = 'Email Marketing',
}

export enum Access_levels {
  FULL = 'full',
  READ = 'read',
  WRITE = 'write',
  TEST= 'test',
  CUSTOM = 'custom',
}


const READ = <TypeOfPermissionType[]>['view']
const WRITE = <TypeOfPermissionType[]>['add', 'edit', 'publish', 'delete']
const FULL = <TypeOfPermissionType[]>['add', 'edit', 'delete', 'view', 'publish']

//Access Level vs What it can do
export const access_level_permissions: AccessLevelPermissions = {
  [Access_levels.READ]: READ,
  [Access_levels.WRITE]: WRITE,
  [Access_levels.FULL]: FULL,
  [Access_levels.CUSTOM]: [],
}
export const access_level_byservice: Record<PermissionServices, Partial<Record<Access_levels, TypeOfPermissionType[]>>> = {
  [PermissionServices.ChatBotFlow]: {
    [Access_levels.READ]: ['view'],
    [Access_levels.WRITE]: ['add', 'edit', 'publish', 'delete'],
    [Access_levels.FULL]: FULL,
    [Access_levels.TEST]: ['publish', 'delete'],
    [Access_levels.CUSTOM]: [],
  },

  [PermissionServices.CommentAutoReply]: {
    [Access_levels.READ]: READ,
    [Access_levels.WRITE]: WRITE,
    [Access_levels.FULL]: FULL,
    [Access_levels.CUSTOM]: [],
  },

  [PermissionServices.EmailMarketing]: {
    [Access_levels.READ]: READ,
    [Access_levels.WRITE]: WRITE,
    [Access_levels.FULL]: FULL,
    [Access_levels.CUSTOM]: [],
  },
}


//Up to here




// Define the structure for each permission group (e.g., ChatBotFlow, CommentAutoReply)
//Use this if you want to extend custom permission
export type AccessStructure = {
  [K in PermissionServices]?: PermissionGroup
}

interface PermissionGroup<T = Access_levels> {
  access: T[] // Array of Access_levels (e.g., READ, WRITE)
  custom?: CustomPermissions // Custom permissions (e.g., view, add, edit, delete, publish)
}

export type CustomPermissions = Partial<Record<TypeOfPermissionType, boolean>>;
export type AccessLevelPermissions = Partial<Record<Access_levels, (TypeOfPermissionType)[]>>;

export interface PermissionData extends SubCollections {
  permission_id: string
  owner_uid: string
  name: string
  assignment: AccessStructure
  createdAt: string
  updatedAt: string
}

//Use when adding a member this is the custom permission
export const default_access: AccessStructure = {
  [PermissionServices.ChatBotFlow]: {
    access: [Access_levels.READ],
  },
  [PermissionServices.CommentAutoReply]: {
    access: [Access_levels.READ],
  },
}

//Use when setting member as the admin
export const admin_access: AccessStructure = {
  [PermissionServices.ChatBotFlow]: {
    access: [Access_levels.FULL],
  },
  [PermissionServices.CommentAutoReply]: {
    access: [Access_levels.FULL],
  },
  [PermissionServices.EmailMarketing]: {
    access: [Access_levels.READ],
  },
}

//Use when updating cutom permission only
export const custom_access: AccessStructure = {
  [PermissionServices.ChatBotFlow]: {
    access: [Access_levels.FULL],
  },
  [PermissionServices.CommentAutoReply]: {
    access: [Access_levels.FULL],
  },
  [PermissionServices.EmailMarketing]: {
    access: [Access_levels.READ],
  },
}

export const custom_permission: Record<PermissionServices, CustomPermissions> = {
  [PermissionServices.ChatBotFlow]: {
    view: false,
    add: false,
    edit: false,
    delete: false,
    publish: false,
    clone: false,
  },
  [PermissionServices.CommentAutoReply]: {
    view: false,
    add: false,
    edit: false,
    delete: false,
    publish: false,
  },
  [PermissionServices.EmailMarketing]: {
    view: false,
    add: false,
    edit: false,
    delete: false,
    publish: false,
  }
}


export const permission_data: PermissionData = {
  permission_id: '',
  owner_uid: '',
  name: 'Untitled Permission',
  assignment: default_access,
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}

import { default_access, type AccessStructure } from './PermissionTypes'
import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export enum TeamRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  LEAD = 'Lead',
  MEMBER = 'Member',
}

export interface TeamData extends SubCollections {
  tm_id: string
  name: string
  owner_uid: string
  inviteLink: string
  createdAt: string
  updatedAt: string
  subCollections: ('team_members'|'team_workspace_refs')[]
  team_members?: TeamMembersData[]
  workspace_refs?: TeamWorkspaceRefsData[]
}

export interface TeamWorkspaceRefsData extends SubCollections {
  workspace_id: string
  owner_uid: string
  createdAt: string
  updatedAt: string
}
export interface TeamMembersData extends SubCollections {
  member_id: string
  uid: string
  role: TeamRole
  accessPermissions: AccessStructure
  isPending: boolean
  isDisabled: boolean
  createdAt: string
  updatedAt: string
  invitation?: TeamInvitation
}

export interface TeamInvitation {
  reference: string
  email: string
  invitedBy: string
}

export const team_data: TeamData = {
  tm_id: '',
  name: '',
  owner_uid: '',
  inviteLink: '',
  createdAt: '',
  updatedAt: '',
  subCollections: ['team_members'],
}
export const team_members_data: TeamMembersData = {
  member_id: '',
  uid: '',
  role: TeamRole.MEMBER,
  accessPermissions: { ...default_access },
  isDisabled: false,
  isPending: false,
  createdAt: '',
  updatedAt: '',
  subCollections: [],
}

export const team_workspace_refs_data: TeamWorkspaceRefsData = {
  workspace_id: '',
  owner_uid: '',
  createdAt: '',
  updatedAt: '',
  subCollections:[]
}

const invitation = {
  reference: '',
  email: '',
  invitedBy: '',
}

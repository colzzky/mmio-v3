import { default_access, default_access_general, type AccessStructure, type GeneralPermission } from './PermissionTypes'
import type { SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export enum TeamRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  LEAD = 'Lead',
  MEMBER = 'Member',
}

export interface TeamData{
  tm_id: string
  name: string
  owner_uid: string
  inviteLink: string
  createdAt: string
  updatedAt: string
}

export interface TeamWorkspaceRefsData{
  workspace_id: string
  owner_uid: string
  createdAt: string
  updatedAt: string
}
export interface TeamMembersData{
  member_id: string
  uid: string
  role: TeamRole
  accessPermissions: AccessStructure
  generalPermissions: GeneralPermission
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
  updatedAt: ''
}
export const team_members_data: TeamMembersData = {
  member_id: '',
  uid: '',
  role: TeamRole.MEMBER,
  accessPermissions: { ...default_access },
  generalPermissions: [...default_access_general ],
  isDisabled: false,
  isPending: false,
  createdAt: '',
  updatedAt: '',
}

export const team_workspace_refs_data: TeamWorkspaceRefsData = {
  workspace_id: '',
  owner_uid: '',
  createdAt: '',
  updatedAt: '',
}

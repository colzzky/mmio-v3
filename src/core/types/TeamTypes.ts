import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface TeamData extends SubCollections {
  tm_id: string,
  name: string,
  owner_uid: string,
  inviteLink: string,
  createdAt: string,
  updatedAt: string,
  subCollections: ('team_members')[],
  team_members?: TeamMembersData[],
}

export interface TeamMembersData extends SubCollections {
  member_id: string,
  uid: string,
  permission: string[],
  isPending: boolean,
  isDisabled: boolean,
  createdAt: string,
  updatedAt: string,
  invitation?: TeamInvitation

}

export interface TeamInvitation {
  reference: string,
  email: string,
  invitedBy: string,
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
  permission: [],
  isDisabled: false,
  isPending: false,
  createdAt: '',
  updatedAt: '',
  subCollections: []
}

const invitation = {
  reference: '',
  email: '',
  invitedBy: '',
}

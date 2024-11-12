import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface TeamData extends SubCollections {
  tm_id: string,
  name: string,
  owner_uid: string,
  inviteLink:string,
  members: {
    uid:string,
    permission:string[],
    isDisabled:boolean,
    dateAdded:string,
    invitation:{
      reference:string,
      email:string,
      invitedBy:string,
    } | null
  }[],
  createdAt: string,
  updatedAt: string,

}

export const team_data:TeamData = {
    tm_id: '',
    name: '',
    owner_uid: '',
    inviteLink: '',
    members: [],
    createdAt: '',
    updatedAt: '',
    subCollections:[],
}

const invitation = {
  reference:'',
  email:'',
  invitedBy:'',
}


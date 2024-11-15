import type { Timestamp, SubCollections } from './UniTypes'

//Only use subcollection if a collection have a data that has multiple data like activity logs etc.

export interface InvitationData extends SubCollections {
    iv_id: string
    type: 'Team Invite'|'Member Team Invite'|'' //team invite or member invite
    reference: InvitationReference
    teamReference?: InvitationReference
    isActive: boolean
    expiration: string
    createdAt: string
    updatedAt: string
}

export interface InvitationReference {
    id: string
    path: string
    collection: string
}

export const invitation_reference:InvitationReference = {
    id: '',
    path: '',
    collection: ''
}

export const invitation_data: InvitationData = {
    iv_id: '',
    type: '',
    reference: {...invitation_reference},
    isActive: true,
    expiration: '',
    createdAt: '',
    updatedAt: '',
    subCollections: []
}



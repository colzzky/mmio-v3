import {
  invitation_data,
  invitation_reference,
  type InvitationData,
} from '@/core/types/InvitationTypes'
import type { TeamData } from '@/core/types/TeamTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type FSReturnData<T> = FirebaseReturnBase & {
  data: T
}

interface Invitation {
  data: InvitationData
  reInit: () => void
  set: (data: InvitationData) => void
}
export const useInvitationStore = defineStore('invitationStore', () => {
  const invitation: Invitation = {
    data: { ...invitation_data },
    reInit() {
      this.data = { ...invitation_data, reference: { ...invitation_reference } }
    },
    set(data: InvitationData) {
      this.data = data
    }
  }

  async function createTeamInvite(
    team: TeamData,
    inviteLink: string,
    type: 'Team Invite' | 'Member Team Invite',
    path: string,
  ) {
    invitation.reInit()
    invitation.data.iv_id = inviteLink
    invitation.data.reference = {
      id: team.tm_id,
      collection: 'teams',
      path,
    }
    invitation.data.expiration = uiHelpers.generateExpirationDate(1800)
    invitation.data.type = type
     await postCollection(DbCollections.invitations, {
      idKey: 'iv_id',
      data: invitation.data,
    })

  }

  // const reset_state = () => {
  //   //workspace.resetData()
  // }

  return {
    invitation,
    createTeamInvite,
  }
})

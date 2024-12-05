import {
  invitation_data,
  invitation_reference,
  type InvitationData,
} from '@/core/types/InvitationTypes'
import type { TeamData } from '@/core/types/TeamTypes'
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
  get: (iv_id: string) => Promise<FSReturnData<InvitationData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<InvitationData>>
}
export const useInvitationStore = defineStore('invitationStore', () => {
  const invitation: Invitation = {
    data: { ...invitation_data },
    reInit() {
      this.data = { ...invitation_data, reference: { ...invitation_reference } }
    },
    set(data: InvitationData) {
      this.data = data
    },
    async get(iv_id: string): Promise<FSReturnData<InvitationData>> {
      const get = await getCollection('invitation', {
        $path: 'invitations',
        $sub_params: {},
        id: iv_id,
        $sub_col: [],
      })

      return {
        status: get.status,
        data: get.data as InvitationData,
        error: get.error,
      }
    },
    async createUpdate(type): Promise<FSReturnData<InvitationData>> {
      const id = this.data.iv_id !== '' ? this.data.iv_id : crypto.randomUUID()
      this.data.iv_id = id
      const post = await postCollection('invitation', {
        $path: 'invitations',
        $sub_params: null,
        id,
        data: this.data,
        type,
      })
      console.log(post)
      return {
        status: post.status,
        data: post.data as InvitationData,
        error: post.error,
      }
    },
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
    invitation.createUpdate('new')
  }

  // const reset_state = () => {
  //   //workspace.resetData()
  // }

  return {
    invitation,
    createTeamInvite,
  }
})

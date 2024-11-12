import type { DocumentData } from 'firebase/firestore'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import { defineStore } from 'pinia'
import { invitation_data, type InvitationData } from '@/core/types/InvitationTypes'

interface FirebaseReturn {
  status: boolean;
  data: DocumentData | undefined;
  error: string;
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>;
type FSReturnData<T> = FirebaseReturnBase & {
  data: T;
};

interface Invitation {
  data: InvitationData
  reInit: () => void
  set: (data: InvitationData) => void
  get: (ws_id: string) => Promise<FSReturnData<InvitationData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<InvitationData>>
}
export const useInvitationStore = defineStore('invitationStore', () => {
  const invitation = <Invitation>({
    data: { ...invitation_data },
    reInit() {
      this.data = { ...invitation_data }
    },
    set(data: InvitationData) {
      this.data = data
    },
    async get(ws_id: string): Promise<FSReturnData<InvitationData>> {
      const get = await getCollection('invitation', 'invitations', {}, ws_id, [])
      return {
        status: get.status,
        data: get.data as InvitationData,
        error: get.error,
      }
    },
    async createUpdate(type): Promise<FSReturnData<InvitationData>> {
      let id = this.data.iv_id !== '' ? this.data.iv_id : crypto.randomUUID();
      this.data.iv_id = id
      const post = await postCollection('invitation', 'invitations', null, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as InvitationData,
        error: post.error,
      }
    },
  })

  const reset_state = () => {
    //workspace.resetData()
  }

  return {
    invitation,
  }
})

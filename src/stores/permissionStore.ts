import { default_access, permission_data, type PermissionData } from '@/core/types/PermissionTypes'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
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

interface Permission {
  data: PermissionData
  reInit: () => void
  set: (data: PermissionData) => void
  get: (permission_id: string) => Promise<FSReturnData<PermissionData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<PermissionData>>
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

export const usePermissionStore = defineStore('permissionStore', () => {
  const permission: Permission = {
    data: { ...permission_data, assignment: { ...default_access } },
    reInit() {
      this.data = { ...permission_data, assignment: { ...default_access } }
      //this is team
    },
    set(data: PermissionData) {
      this.data = data
    },
    async get(permission_id: string): Promise<FSReturnData<PermissionData>> {
      const get = await getCollection('permission', 'permissions', {}, permission_id, [])
      return {
        status: get.status,
        data: get.data as PermissionData,
        error: get.error,
      }
    },
    async createUpdate(type): Promise<FSReturnData<PermissionData>> {
      const id = this.data.permission_id !== '' ? this.data.permission_id : crypto.randomUUID()
      this.data.permission_id = id
      const post = await postCollection('permission', 'permissions', null, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as PermissionData,
        error: post.error,
      }
    },
  }

  //Regenerate Team Invite

  return {
    permission,
  }
})

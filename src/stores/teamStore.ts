import { workspace_data, type WorkspaceData } from '@/core/types/WorkSpaceTypes'
import type { DocumentData } from 'firebase/firestore'
import { useAuthStore } from './authStore'
import { reactive } from 'vue'
import { getCollection, postCollection } from '@/core/utils/firebase-collections'
import { defineStore } from 'pinia'
import { team_data, team_members_data, team_workspace_refs_data, type TeamData, type TeamMembersData, type TeamWorkspaceRefsData } from '@/core/types/TeamTypes'
import { useUserStore } from './userStore'
const userStore = useUserStore()
const { user_team_refs } = userStore

//Comment for testing

interface FirebaseReturn {
  status: boolean;
  data: DocumentData | undefined;
  error: string;
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>;
type FSReturnData<T> = FirebaseReturnBase & {
  data: T;
};

interface Team {
  data: TeamData
  reInit: () => void
  set: (data: TeamData) => void
  get: (tm_id: string) => Promise<FSReturnData<TeamData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<TeamData>>
}

interface TeamMembers {
  data: TeamMembersData
  reInit: () => void
  set: (data: TeamMembersData) => void
  get: (tm_id: string, member_id:string) => Promise<FSReturnData<TeamMembersData>>
  createUpdate: (tm_id: string, type: 'new' | 'update') => Promise<FSReturnData<TeamMembersData>>
}

interface TeamWorkspaceRefs {
  data: TeamWorkspaceRefsData
  reInit: () => void
  set: (data: TeamWorkspaceRefsData) => void
  get: (tm_id: string, workspace_id:string) => Promise<FSReturnData<TeamWorkspaceRefsData>>
  createUpdate: (tm_id: string, type: 'new' | 'update') => Promise<FSReturnData<TeamWorkspaceRefsData>>
}

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}

export const useTeamStore = defineStore('teamStore', () => {
  const team = <Team>({
    data: { ...team_data },
    reInit() {
      this.data = { ...team_data}
      //this is team
    },
    set(data: TeamData) {
      this.data = data
    },
    async get(tm_id: string): Promise<FSReturnData<TeamData>> {
      const get = await getCollection('team', 'teams', {}, tm_id, [])
      return {
        status: get.status,
        data: get.data as TeamData,
        error: get.error,
      }
    },
    async createUpdate(type): Promise<FSReturnData<TeamData>> {
      const id = this.data.tm_id !== '' ? this.data.tm_id : crypto.randomUUID();
      this.data.tm_id = id
      const post = await postCollection('team', 'teams', null, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as TeamData,
        error: post.error,
      }
    },
  })

  const team_members = <TeamMembers>({
    data: { ...team_members_data },
    reInit() {
      this.data = { ...team_members_data}
      //this is team
    },
    set(data: TeamMembersData) {
      this.data = data
    },
    async get(tm_id: string, member_id:string): Promise<FSReturnData<TeamMembersData>> {
      const get = await getCollection('team_members', 'teams/:tm_id/team_members', {tm_id:tm_id}, member_id, [])
      return {
        status: get.status,
        data: get.data as TeamMembersData,
        error: get.error,
      }
    },
    async createUpdate(tm_id: string, type): Promise<FSReturnData<TeamMembersData>> {
      const id = this.data.member_id !== '' ? this.data.member_id : crypto.randomUUID();
      this.data.member_id = id
      const post = await postCollection('team_members', 'teams/:tm_id/team_members', {tm_id}, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as TeamMembersData,
        error: post.error,
      }
    },
  })

  const team_workspace_refs = <TeamWorkspaceRefs>({
    data: { ...team_workspace_refs_data },
    reInit() {
      this.data = { ...team_workspace_refs_data}
      //this is team
    },
    set(data: TeamWorkspaceRefsData) {
      this.data = data
    },
    async get(tm_id: string, workspace_id:string): Promise<FSReturnData<TeamWorkspaceRefsData>> {
      const get = await getCollection('team_workspace_refs', 'teams/:tm_id/team_workspace_refs', {tm_id:tm_id}, workspace_id, [])
      return {
        status: get.status,
        data: get.data as TeamWorkspaceRefsData,
        error: get.error,
      }
    },
    async createUpdate(tm_id: string, type): Promise<FSReturnData<TeamWorkspaceRefsData>> {
      const id = this.data.workspace_id !== '' ? this.data.workspace_id : crypto.randomUUID();
      this.data.workspace_id = id
      const post = await postCollection('team_workspace_refs', 'teams/:tm_id/team_workspace_refs', {tm_id}, id, this.data, type)
      console.log(post)
      return {
        status: post.status,
        data: post.data as TeamWorkspaceRefsData,
        error: post.error,
      }
    },
  })

  //Regenerate Team Invite

  return {
    team,
    team_members,
    team_workspace_refs
  }
})

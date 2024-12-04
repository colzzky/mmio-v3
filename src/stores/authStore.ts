import { usePlatformAPIStore } from './platformAPIStore'
import type { UserData } from '@/core/types/AuthUserTypes'
import { user_data } from '@/core/types/AuthUserTypes'
import type { PermissionData } from '@/core/types/PermissionTypes'
import type { TeamData } from '@/core/types/TeamTypes'
import type { MutablePick } from '@/core/types/UniTypes'
import { auth } from '@/core/utils/firebase-client'
import { postCollection, getCollection, getWhereAny } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import type { DocumentData } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

interface FirebaseReturn {
  status: boolean
  data: DocumentData | undefined
  error: string
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>
type FSReturnData<T> = FirebaseReturnBase & {
  data: T
}

interface AuthUser {
  data: UserData | null
  isInitialized: boolean
  initialize: () => void
  set: (data: UserData) => void
  get: (id: string) => Promise<FSReturnData<UserData>>
  createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<UserData>>
}

export const useAuthStore = defineStore(
  'authStore',
  () => {
    const page_init = reactive({
      initialize: false as boolean,
    })
    const user_auth = reactive({
      data: null as User | null,
      isInitializing: false as boolean,
      setUser(currentUser: User | null) {
        this.data = currentUser
      },
      async initializeUser(): Promise<boolean> {
        if (this.data) {
          const uid = user_auth.data ? user_auth.data.uid : ''
          const fetch_user = await user.get(uid)
          if (fetch_user.status) {
            user.set(fetch_user.data)
          }
          return true
        } else {
          return false
        }
      },

      isUserAuthenticated(): boolean {
        return this.data != null && typeof this.data === 'object' && 'uid' in this.data && 'email' in this.data;
      },

      check_user_auth(): Promise<boolean> {
        return new Promise((resolve, reject) => {
          onAuthStateChanged(auth, (user) => {
            if (user) {
              this.setUser(user)
              resolve(true); // User is signed in
            } else {
              this.setUser(null)
              resolve(false); // No user is signed in
            }
          });
        });
      },

      async signOut() {
        await signOut(auth)
        await resetAllStore()
      },
    })

    const user = reactive<AuthUser>({
      data: null,
      isInitialized: false,
      initialize() {
        this.data = { ...user_data }
        this.isInitialized = true
      },
      set(data) {
        this.data = data
        console.log(this.data)
        this.isInitialized = true
      },
      async get() {
        const id = user_auth.data ? user_auth.data.uid : ''
        const get = await getCollection('user', {
          $path: 'users',
          $sub_params: null,
          id: id,
          $sub_col: ['team_refs', 'platform_apis'],
        })
        console.log(get)
        return {
          status: get.status,
          data: get.data as UserData,
          error: get.error,
        }
      },

      async createUpdate(type): Promise<FSReturnData<UserData>> {
        const id = user_auth.data ? user_auth.data.uid : ''
        const post = await postCollection('user', {
          $path: 'users',
          $sub_params: null,
          id,
          data: this.data,
          type,
        })
        return {
          status: post.status,
          data: post.data as UserData,
          error: post.error,
        }
      },
    })

    const user_team_refs = reactive({
      data: [] as TeamData[],
      isInitialized: false as boolean,
      isLoading: false as boolean,
      lastSnapshot: '' as string,
      nextFetch: '' as string,
      resetData(): void {
        this.data = []
        this.isInitialized = false
        this.isLoading = false
        this.lastSnapshot = ''
      },
      async fetch_team_list(): Promise<void> {
        this.isLoading = true
        const user_teams: string[] = []
        if (user.data && user.data.team_refs) {
          user.data.team_refs.forEach((team) => {
            user_teams.push(team.tm_id)
          })
          const fetch_team = await getWhereAny('team', {
            $path: 'teams',
            $sub_params: {},
            $sub_col: ['team_members'],
            whereConditions: [
              {
                fieldName: 'tm_id',
                operator: 'in',
                value: user_teams,
              },
            ],
          })

          console.log(fetch_team)
          if (fetch_team.status) {
            this.data = fetch_team.data
          }
        }
        this.isLoading = false
        this.isInitialized = true
      },
    })

    const user_created_permissions = reactive({
      data: [] as PermissionData[],
      isInitialized: false as boolean,
      isLoading: false as boolean,
      lastSnapshot: '' as string,
      nextFetch: '' as string,
      generateNextFetch(): void {
        this.nextFetch = uiHelpers.generateExpirationDate(300)
      },
      checkNextFetch(): boolean {
        if (this.nextFetch) {
          const now = new Date()
          const expireDate = new Date(this.nextFetch)
          console.log(expireDate)
          return now >= expireDate
        }
        return true
      },
      resetData(): void {
        this.data = []
        this.isInitialized = false
        this.isLoading = false
        this.lastSnapshot = ''
      },
    })

    //Store the information that needs persisting when moving to other page
    const user_details = reactive({
      team_owners_uid: [] as string[],
      team_owners: null as { [key: string]: UserData } | null,
      user_permissions: null,
    })

    //Called during initiali Registration
    async function createNewUserProfile(
      data: MutablePick<User, 'displayName' | 'email' | 'photoURL' | 'uid' | 'emailVerified'>,
    ) {
      //We need to check first if the user already exist in firebase
      const checkUser = await user.get(data.uid)
      if (!checkUser.status) {
        user.initialize()
        if (user.data) {
          console.log(user.data)
          user.data = { ...user.data, ...data }
          console.log(user.data)
          await user.createUpdate('new')
        }
      }
    }

    async function after_auth_initialization() {
      const platformApiStore = usePlatformAPIStore()
      const { platform_api_list } = platformApiStore

      await user_team_refs.fetch_team_list()
      await platform_api_list.initializeAccountApis()
    }

    //called when initially fetching team refrence
    async function resetAllStore() {
      //Reset something here
    }

    return {
      page_init,
      createNewUserProfile,
      user,
      user_auth,
      user_team_refs,
      user_details,
      user_created_permissions,
      after_auth_initialization,
    }
  },
  {
    persist: {
      pick: ['user_auth', 'user'], // Only persist user_profile
    },
  },
)

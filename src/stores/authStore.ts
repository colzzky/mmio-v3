import { usePlatformAPIStore } from './platformAPIStore'
import type { PlatformApiData, TeamRefsData, UserData } from '@/core/types/AuthUserTypes'
import { user_data } from '@/core/types/AuthUserTypes'
import type { PermissionData } from '@/core/types/PermissionTypes'
import { team_members_data, type TeamData, type TeamMembersData } from '@/core/types/TeamTypes'
import type { MutablePick } from '@/core/types/UniTypes'
import { DbCollections } from '@/core/utils/enums/dbCollection'
import { auth } from '@/core/utils/firebase-client'
import { postCollection, getCollection, getWhereAny, getCollectionWithSubcollections, getWhereAnyWithSubcollections } from '@/core/utils/firebase-collections'
import { uiHelpers } from '@/core/utils/ui-helper'
import { onAuthStateChanged, signOut, type Unsubscribe, type User } from 'firebase/auth'
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
  references: {
    user_team_refs: TeamRefsData[]
    platform_apis: PlatformApiData[]
  } | null
  isInitialized: boolean
  initialize: () => void
  fetch: () => Promise<void>
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
      isAuthListenerActive: false as boolean,
      authListener: null as (() => Unsubscribe | void) | null,
      setUser(currentUser: User | null) {
        this.data = currentUser
      },
      async initializeUser(): Promise<boolean> {
        if (this.data) {
          await user.fetch()
          return true
        } else {
          return false
        }
      },

      isUserAuthenticated(): boolean {
        return this.data != null && typeof this.data === 'object' && 'uid' in this.data && 'email' in this.data;
      },

      user_auth_initialization(): Promise<boolean> | boolean {
        console.log(this.isAuthListenerActive)
        if (this.isAuthListenerActive) {
          return this.data !== null;
        }

        // Set the flag to true and initialize the listener
        this.isAuthListenerActive = true;

        return new Promise((resolve) => {
          this.authListener = onAuthStateChanged(auth, async (user) => {
            if (user) {
              console.log('signed in')
              this.setUser(user);
              await user_auth.initializeUser();
              await after_auth_initialization();
              resolve(true); // User is signed in
            } else {
              this.setUser(null);
              console.log('You have been logged out');
              resolve(false); // No user is signed in
            }
          });
        });
      },

      listener_refresh() {
        this.isAuthListenerActive = false;
        if (this.authListener !== null) {
          this.authListener()
        }
        this.authListener = null
      },

      async signOut() {
        await signOut(auth)
        await resetAllStore()
      },
    })

    const user = reactive<AuthUser>({
      data: null,
      references: null,
      isInitialized: false,
      initialize() {
        this.data = { ...user_data }
        this.isInitialized = true
      },
      async fetch() {
        const id = user_auth.data ? user_auth.data.uid : ''
        const get = await getCollectionWithSubcollections(DbCollections.users, {
          $sub_params: null,
          id: id,
          subCollections: [[DbCollections.platform_apis], [DbCollections.team_refs]]
        })
        
        if (get.data && get.status) {
          this.references = {
            user_team_refs: [],
            platform_apis: []
          }
          this.data = get.data.main
          this.references.user_team_refs = get.data.subCollections[DbCollections.team_refs]
          this.references.platform_apis = get.data.subCollections[DbCollections.platform_apis]
        }

        console.log(this.data)
        console.log(this.references)
      },
    })

    const user_team_refs = reactive({
      data: null as Record<string, {'team': TeamData, 'members': TeamMembersData[]}> | null,
      isInitialized: false as boolean,
      isLoading: false as boolean,
      lastSnapshot: '' as string,
      resetData(): void {
        this.data = null
        this.isInitialized = false
        this.isLoading = false
        this.lastSnapshot = ''
      },
      async fetch_team_list(): Promise<void> {
        this.isLoading = true
        const user_teams: string[] = []
        if (user.data && user.references && user.references.user_team_refs && user.references.user_team_refs.length > 0) {
          user.references.user_team_refs.forEach((team) => {
            user_teams.push(team.tm_id)
          })
          const fetch_team = await getWhereAnyWithSubcollections(DbCollections.teams, {
            subCollections: [[DbCollections.team_members]],
            whereConditions: [
              {
                fieldName: 'tm_id',
                operator: 'in',
                value: user_teams,
              },
            ],
          })

          if (fetch_team.status && fetch_team.data) {
            this.data = fetch_team.data.reduce((acc, { main, subCollections }) => {
              acc[main.tm_id] = {  team:{...main}, members: subCollections['teams/:tm_id/team_members'] };  // Merge main with sub
              return acc;
            }, {} as Record<string, {'team': TeamData, 'members': TeamMembersData[]}>);
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
      const checkUser = await getCollection(DbCollections.users,{
        id:user.data ? user.data.uid : ''    
      })
      if (!checkUser.status) {
        user.initialize()
        if (user.data) {
          console.log(user.data)
          user.data = { ...user.data, ...data }
          console.log(user.data)
          
          await postCollection(DbCollections.users, {
            idKey: 'uid',
            data: user.data,
          })
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

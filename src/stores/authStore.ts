import type { UserData, UserAddress, TeamRefsData } from '@/core/types/AuthUserTypes'
import { team_refs_data, user_data } from '@/core/types/AuthUserTypes'

import type { MutablePick, Timestamp } from '@/core/types/UniTypes'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { FirebaseWhereCondition, FirebaseOrderCondition } from '@/core/utils/firebase-collections'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { postCollection, getCollection, getCollectionByField, getWhereAny } from '@/core/utils/firebase-collections';
import { auth } from '@/core/utils/firebase-client';
import type { DocumentData } from 'firebase/firestore';
import { useProjectStore } from './projectStore'
import type { TeamData } from '@/core/types/TeamTypes'
import type { PermissionData } from '@/core/types/PermissionTypes'
import router from '@/router'
import { uiHelpers } from '@/core/utils/ui-helper'

interface FirebaseReturn {
    status: boolean;
    data: DocumentData | undefined;
    error: string;
}
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>;
type FSReturnData<T> = FirebaseReturnBase & {
    data: T;
};

interface AuthUser {
    data: UserData | null
    isInitialized: boolean
    initialize: () => void,
    set: (data: UserData) => void
    get: (id: string) => Promise<FSReturnData<UserData>>
    createUpdate: (type: 'new' | 'update') => Promise<FSReturnData<UserData>>
}


interface TeamRefs {
    data: TeamRefsData
    reInit: () => void
    set: (data: TeamRefsData) => void
}

export const useAuthStore = defineStore('authStore', () => {
    const page_init = reactive({
        initialize: <boolean>false
    })
    const user_auth = reactive({
        data: <User | null>null,
        isInitializing: <boolean>false,
        setUser(currentUser: User | null) {
            this.data = currentUser
        },
        async initializeUser(): Promise<boolean> {
            this.isInitializing = true
            const authStatePromise = new Promise((resolve) => {
                onAuthStateChanged(auth, (user: User | null) => {
                    resolve(user)
                });
            });
            const uid = user_auth.data ? user_auth.data.uid : ''
            const fetch_user = await user.get(uid)
            if (fetch_user.status) {
                user.set(fetch_user.data)
            }

            const check = await authStatePromise.then((user: any) => {
                this.setUser(user)
                if (this.data) {
                    return true
                } else {
                    return false
                }
            })
            this.isInitializing = false
            return check
        },

        async check_user_auth() {
            const user = auth.currentUser;
            if (this.data && user) {
                return true
            } else {
                return false
            }
        },

        async signOut() {
            await signOut(auth)
            await resetAllStore()
        }
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
            const get = await getCollection('user', 'users', null, id, ['team_refs', 'platform_apis']);
            console.log(get)
            return {
                status: get.status,
                data: get.data as UserData,
                error: get.error
            }
        },

        async createUpdate(type): Promise<FSReturnData<UserData>> {
            const id = user_auth.data ? user_auth.data.uid : ''
            const post = await postCollection('user', 'users', null, id, this.data, type)
            return {
                status: post.status,
                data: post.data as UserData,
                error: post.error
            }
        },
    })

    const user_team_refs = reactive({
        data: <TeamData[]>[],
        isInitialized: <boolean>false,
        isLoading: <boolean>false,
        lastSnapshot: <any>'',
        resetData() {
            this.data = []
            this.isInitialized = false
            this.isLoading = false
            this.lastSnapshot = ''
        }
    })

    const user_created_permissions = reactive({
        data: <PermissionData[]>[],
        isInitialized: <boolean>false,
        isLoading: <boolean>false,
        lastSnapshot: <any>'',
        nextFetch:<string>'',
        generateNextFetch(){
            this.nextFetch = uiHelpers.generateExpirationDate(300)
        },
        checkNextFetch(){
            if(this.nextFetch){
                const now = new Date();
                const expireDate = new Date(this.nextFetch);
                console.log(expireDate)
                return now >= expireDate;
            }
            return true
        },
        resetData() {
            this.data = []
            this.isInitialized = false
            this.isLoading = false
            this.lastSnapshot = ''
        },
    })

    //Store the information that needs persisting when moving to other page
    const user_details = reactive({
        team_owners_uid: <string[]>[],
        team_owners:<{ [key: string]: UserData } | null>(null),
        user_permissions:null
    })


    //Called during initiali Registration
    async function createNewUserProfile(data: MutablePick<User, 'displayName' | 'email' | 'photoURL' | 'uid' | 'emailVerified'>) {
        //We need to check first if the user already exist in firebase
        const checkUser = await user.get(data.uid)
        if (!checkUser.status) {
            user.initialize()
            if (user.data) {
                console.log(user.data)
                user.data = { ...user.data, ...data }
                console.log(user.data)
                await user.createUpdate('new');
            }
        }
    }

    //called when initially fetching team refrence
    async function fetch_team_list() {
        console.log('fetching Team references.....')
        user_team_refs.isLoading = true
        const user_teams: string[] = []
        if (user.data && user.data.team_refs) {
            user.data.team_refs.forEach(team => {
                user_teams.push(team.tm_id)
            })
            const fetch_team = await getWhereAny('team', 'teams', {}, ['team_members'], [{
                fieldName: 'tm_id', operator: 'in', value: user_teams
            }])
            console.log(fetch_team)
            if (fetch_team.status) {
                user_team_refs.data = fetch_team.data
            }
        }
        user_team_refs.isLoading = false
        user_team_refs.isInitialized = true
    }

    async function resetAllStore() {
        const projectStore = useProjectStore()
        projectStore.reset_state()
    }

    return {
        page_init,
        createNewUserProfile,
        user,
        user_auth,
        user_team_refs,
        fetch_team_list,
        user_details,
        user_created_permissions
    }
},
    {
        persist: {
            pick: ['user_auth', 'user']  // Only persist user_profile
        }
    })

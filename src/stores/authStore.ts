import type { UserData, UserAddress, TeamRefsData } from '@/core/types/AuthUserTypes'
import { team_refs_data, user_data } from '@/core/types/AuthUserTypes'

import type { MutablePick, Timestamp } from '@/core/types/UniTypes'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { FirebaseWhereCondition, FirebaseOrderCondition } from '@/core/utils/firebase-collections'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { postCollection, getCollection, getCollectionByField } from '@/core/utils/firebase-collections';
import { auth } from '@/core/utils/firebase-client';
import type { DocumentData } from 'firebase/firestore';
import { useProjectStore } from './projectStore'

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
    get: (ws_id: string) => Promise<FSReturnData<TeamRefsData>>
    createUpdate: (uid:string, type: 'new' | 'update') => Promise<FSReturnData<TeamRefsData>>
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
            const get = await getCollection('user', 'users', null, id, []);
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

    const user_team_refs = reactive<TeamRefs>({
        data: { ...team_refs_data },
        reInit() {
            this.data = { ...team_refs_data }
            //this is team
        },
        set(data: TeamRefsData) {
            this.data = data
        },
        async get(tm_id: string): Promise<FSReturnData<TeamRefsData>> {
            const get = await getCollection('team', 'teams', {}, tm_id, [])
            return {
                status: get.status,
                data: get.data as TeamRefsData,
                error: get.error,
            }
        },
        async createUpdate(uid:string, type): Promise<FSReturnData<TeamRefsData>> {
            let id = this.data.team_refs_id !== '' ? this.data.team_refs_id : crypto.randomUUID();
            this.data.team_refs_id = id
            const post = await postCollection('team_refs', 'users/:uid/team_refs', {uid}, id, this.data, type)
            console.log(post)
            return {
                status: post.status,
                data: post.data as TeamRefsData,
                error: post.error,
            }
        },
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

    async function resetAllStore() {
        const projectStore = useProjectStore()
        projectStore.reset_state()
    }
    return {
        page_init,
        createNewUserProfile,
        user,
        user_auth
    }
},
    {
        persist: {
            pick: ['user_auth', 'user']  // Only persist user_profile
        }
    })

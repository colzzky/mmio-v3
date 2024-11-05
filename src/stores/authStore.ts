import type { UserData, UserAddress } from '@/core/types/AuthUserTypes'
import { user_data } from '@/core/types/AuthUserTypes'

import type { MutablePick, Timestamp } from '@/core/types/UniTypes'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type {  FirebaseWhereCondition, FirebaseOrderCondition } from '@/core/utils/firebase-collections'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { postCollection, getCollection, getCollectionByField } from '@/core/utils/firebase-collections';
import { auth } from '@/core/utils/firebase-client';
import type { DocumentData } from 'firebase/firestore';
import { useProjectStore } from './projectStore'


// type Nullable<T> = {
//     [P in keyof T]: T[P] | null;
// };
// Add a new key "id" while preserving original keys
type PickAnyKey<T> = {
    // Original keys from UserProfileData
    [K in keyof T]?: T[K];
};


interface AuthUser {
    data: UserData | null
    isInitialized: boolean
    initialize: () => void,
    set: (data: UserData) => void
    get: (id: string) => Promise<UserReturnData>
    createUpdate: (type: 'new' | 'update') => Promise<UserReturnData>
}

interface FirebaseReturn {
    status: boolean;
    data: DocumentData | undefined;
    error: string;
}
// Create a base type that omits 'data'
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>;
type UserReturnList = FirebaseReturnBase & {
    data: PickAnyKey<UserData>[];
};
type UserReturnData = FirebaseReturnBase & {
    data: UserData;
};



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
        async get(id: string) {
            const get = await getCollection('user', 'users', null, id);
            return {
                status: get.status,
                data: get.data as UserData,
                error: get.error
            }
        },
        set(data) {
            this.data = data
            this.isInitialized = true
            console.log(this.data)
        },

        async createUpdate(type):Promise<UserReturnData> {
            const post = await postCollection('user', 'users', null, this.data?.uid, this.data, type)
            return {
                status: post.status,
                data: post.data as UserData,
                error: post.error
            }
        },
    })

    //Called during initiali Registration
    async function createNewUserProfile(data:MutablePick<User, 'displayName' | 'email' | 'photoURL' | 'uid' | 'emailVerified'>) {
        //We need to check first if the user already exist in firebase
        const checkUser = await user.get(data.uid)
        if (!checkUser.status) {
            user.initialize()
            if(user.data){
                console.log(user.data)
                user.data = {...user.data, ...data}
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
            pick: ['user_auth']  // Only persist user_profile
        }
    })

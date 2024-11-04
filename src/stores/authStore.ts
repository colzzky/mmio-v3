import type { UserProfileData } from '@/core/types/AuthUserTypes'
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


interface UserProfile {
    data: PickAnyKey<UserProfileData> | null
    isInitialized: boolean
    initialize: () => void,
    get: (id: string) => Promise<UserProfileReturnData>
    getWhere: (where: FirebaseWhereCondition<'user_profile'>[], limit?: number, orderBy?: FirebaseOrderCondition<'user_profile'>[], startAfterDoc?: string) => Promise<UserProfileReturnList>
    set: (data: PickAnyKey<UserProfileData>) => void
    createInitial: (data: PickAnyKey<UserProfileData> | null, type: 'update' | 'new') => Promise<void>
    update: () => Promise<FirebaseReturn>
}

interface FirebaseReturn {
    status: boolean;
    data: DocumentData | undefined;
    error: string;
}
// Create a base type that omits 'data'
type FirebaseReturnBase = Omit<FirebaseReturn, 'data'>;
type UserProfileReturnList = FirebaseReturnBase & {
    data: PickAnyKey<UserProfileData>[];
};
type UserProfileReturnData = FirebaseReturnBase & {
    data: UserProfileData;
};


export const useAuthStore = defineStore('authStore', () => {
    const page_init=reactive({
        initialize:<boolean>false
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

        async check_user_auth(){
            const user = auth.currentUser;
            if(this.data && user){
                return true
            }else{
                return false
            }
        },



        async signOut() {
            await signOut(auth)
            await resetAllStore()
        }
    })
    const user_profile = reactive<UserProfile>({
        data: null,
        isInitialized: false,
        initialize() {
            this.data = {
                up_id: '',
                uid: '',
                firstName: '',
                lastName: '',
                contactEmail: '',
                address: {
                    city: '',
                    state: '',
                    country: '',
                    street: '',
                    zipCode: '',
                },
                createdAt: '',
                updatedAt: '',
            }
            this.isInitialized = true
            
        },
        async get(id: string) {
            const get = await getCollection('user_profile', 'up_id', id);
            return {
                status: get.status,
                data: get.data as UserProfileData,
                error: get.error
            }
        },
        //Call for custom statement
        async getWhere(where, limit, orderBy, snapshot) {
            // Make sure to pass the correct parameters
            const get = await getCollectionByField('user_profile', 'up_id', where, limit, orderBy, snapshot);
            return {
                status: get.status,
                data: get.data as PickAnyKey<UserProfileData>[],
                error: get.error
            }
        },
        //Set Manually
        set(data) {
            this.data = data
            this.isInitialized = true
            console.log(this.data)
        },
        //For creating new data in firestore
        async createInitial(data, type): Promise<void> {
            if (user_auth.data) {
                const id = crypto.randomUUID();
                this.initialize()
                if (data && this.data) {
                    this.data.up_id = id
                    this.data.uid = data.uid
                }

                const post = await postCollection('user_profile', 'up_id', id, this.data, type)
                if (post.status) {
                    this.data = post.data as PickAnyKey<UserProfileData>
                    this.isInitialized = true
                }
            }
        },
        //For updating basic Information
        async update(): Promise<FirebaseReturn> {
            console.log(this.data)
            if (this.data && this.data.up_id) {
                const post = await postCollection('user_profile', 'up_id', this.data.up_id, this.data, 'update')
                return post
            } else {
                return {
                    status: false,
                    error: 'Something went wrong please try again',
                    data: undefined
                }
            }
        },
    })

    //Called during initiali Registration
    async function createNewUserProfile(uid: string) {
        //We need to check first if the user already exist in firebase
        const checkUser = await user_profile.getWhere([
            { fieldName: 'uid', operator: '==', value: uid }
        ])
        console.log('checkUser')
        console.log(checkUser)
        if (!checkUser.status || checkUser.data.length === 0) {
            const data: Pick<UserProfileData, "uid"> = {
                uid: uid,
            }
            await user_profile.createInitial(data, 'new')
        }
    }

    async function resetAllStore(){
        const projectStore = useProjectStore()
        projectStore.reset_state()
    }
    return {
        page_init,
        createNewUserProfile,
        user_profile,
        user_auth
    }
},
    {
        persist: {
            pick: ['user_auth']  // Only persist user_profile
        }
    })

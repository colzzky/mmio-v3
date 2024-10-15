import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { postCollection, getCollection, getCollectionByField } from '@/core/utils/firebase-collections';
import { auth } from '@/core/utils/firebase-client';
import type { DocumentData } from 'firebase/firestore';



interface Timestamp {
    seconds: number;      // The number of seconds
    nanoseconds: number;  // The number of nanoseconds
}
interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}
interface UserProfileData {
    up_id: string
    uid: string
    firstName: string
    lastName: string
    contactEmail: string
    address: Address
    createdAt: Timestamp | string
    updatedAt: Timestamp | string
}
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};
// Add a new key "id" while preserving original keys
type PickAnyKey<T> = {
    // Original keys from UserProfileData
    [K in keyof T]?: T[K];
};


interface UserProfile {
    data: PickAnyKey<UserProfileData> | null
    isInitialized: boolean
    get: (id: string) => Promise<void>
    getWhere: (fieldName: keyof UserProfileData, operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in', fieldValue: any) => Promise<UserProfileReturn>
    set: (data: PickAnyKey<UserProfileData>) => void
    setNew: (data: PickAnyKey<UserProfileData> | null, type: 'update' | 'new') => Promise<void>
    update: () => Promise<FirebaseReturn>
}

interface FirebaseReturn {
    status: boolean;
    data: DocumentData | undefined;
    error: string;
}

type UserProfileReturn = Omit<FirebaseReturn, 'data'> & {
    data: PickAnyKey<UserProfileData>[]; // Add the new data type
};



export const useAuthStore = defineStore('authStore', () => {
    const user_auth = reactive({
        data: <User | null>null,
        setUser(currentUser: User | null) {
            this.data = currentUser
        },
        checkUser(): boolean {
            onAuthStateChanged(auth, (user: User | null) => {
                if (user) {
                    this.setUser(user)
                } else {
                    this.setUser(null)
                }
            });
            if (this.data) return true
            return false
        },
        async signOut() {
            await signOut(auth)
            this.setUser(null)
        }
    })
    const user_profile = reactive<UserProfile>({
        data: null,
        isInitialized: false,
        async get(id: string) {
            if (!this.isInitialized) {
                const get = await getCollection('user_profile', 'up_id', id);
                if (get.status) {
                    this.data = get.data as PickAnyKey<UserProfileData>
                    this.isInitialized = true
                } else {
                    this.data = null
                }
            } else {
                console.log(this.data)
            }
        },
        //Call for custom statement
        async getWhere(fieldName, operator, fieldValue) {
            const get = await getCollectionByField('user_profile', 'up_id', fieldName, operator, fieldValue);
            return {
                status: get.status,
                data: get.data as PickAnyKey<UserProfileData>[],
                error: get.error
            }
        },
        
        //Set Manually
        set(data){
            this.data = data
            this.isInitialized = true
            console.log(this.data)
        },
        //For creating new data in firestore
        async setNew(data, type): Promise<void> {
            if (user_auth.data) {
                const id = crypto.randomUUID();
                if(data) data.up_id = id
                console.log(data)
                const post = await postCollection('user_profile', 'up_id', id, data, type)
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
        const data: Pick<UserProfileData, "uid"> = {
            uid: uid,
        }
        await user_profile.setNew(data, 'new')
    }

    return {
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

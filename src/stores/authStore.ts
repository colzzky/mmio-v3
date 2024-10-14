import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { postCollection } from '@/core/utils/firebase-collections';
import { auth } from '@/core/utils/firebase-client';


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
type PickAnyKey<T> = {
    // Allows any key from the original interface
    [K in keyof T]?: T[K];
};

interface UserProfile {
    data: UserProfileData | null
    getUserProfile: () => void
    setUserProfile: (data: PickAnyKey<UserProfileData> | null, type:'find'|'new') => Promise<void>
    updateAddress: (data: Address) => void
    updateProfile: () => void
}



export const useAuthStore = defineStore('authStore', () => {
    const user_auth = reactive({
        data: <User | null>null,
        setUser(currentUser: User | null) {
            this.data = currentUser
        },
        checkUser(): boolean {
            onAuthStateChanged(auth, (user: User | null) => {
                if (user) {
                    this.data = user
                } else {
                    this.data = null
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
        getUserProfile() {
            //
        },
        async setUserProfile(data, type): Promise<void> {
            if (user_auth.data) {
                await postCollection('user_profile', user_auth.data?.uid, data, type)
            }
        },
        updateAddress(data: Address): void {
            if (this.data) {
                this.data.address = data
            }
        },
        updateProfile() {
            if (this.data) {
                //Call firebase to save profile only
            }
        }
    })

    //Called during initiali Registration
    async function createUserProfile(uid: string) {
        const data: Pick<UserProfileData, "uid"> = {
            uid: uid,
        }
        await user_profile.setUserProfile(data,'new')
    }

    return {
        createUserProfile,
        user_auth
    }
},
    { persist: true })

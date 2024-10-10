import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/core/utils/firebase-client';

export const useAuthStore = defineStore('authStore', () => {
    const user_auth = reactive({
        data: <User | null>null,
        setUser(currentUser: User | null) {
            this.data=currentUser
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

    return {
        user_auth
    }
},
    { persist: true })

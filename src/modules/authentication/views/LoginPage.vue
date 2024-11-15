<script setup lang="ts">
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { useToast } from '@/core/components/ui/toast'
import { Toaster } from '@/core/components/ui/toast'
import { auth } from '@/core/utils/firebase-client'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { Icon } from '@iconify/vue'
import {
  browserLocalPersistence,
  FacebookAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { reactive, ref } from 'vue'

const authStore = useAuthStore()
const { user_auth, createNewUserProfile } = authStore
const { toast } = useToast()

// USER SIGNIN WITH EMAIL AND PASSWORD
const isSignInCredentialsFormVisible = ref(false)
function toggleSignInCredentialsForm() {
  isSignInCredentialsFormVisible.value = !isSignInCredentialsFormVisible.value
}

const form = reactive({
  email: 'superadmin@mmio.com',
  password: 'password',
})
const loginLoad = ref<boolean>(false)
async function handleLoginUser() {
  // todo: implement authentication
  await loginUser(form.email, form.password)
}

const loginUser = async (email: string, password: string): Promise<void> => {
  loginLoad.value = true
  await setPersistence(auth, browserLocalPersistence).then(async () => {
    await signInWithEmailAndPassword(auth, email, password)
      .then(async () => {
        if (auth.currentUser) {
          user_auth.setUser(auth.currentUser)
          await createNewUserProfile({
            displayName: auth.currentUser.displayName,
            email: auth.currentUser.email,
            emailVerified: auth.currentUser.emailVerified,
            photoURL: auth.currentUser.photoURL,
            uid: auth.currentUser.uid,
          })
          router.replace({ name: 'home' })
        }
      })
      .catch((error) => {
        toast({
          title: 'Registration error',
          description: error,
          variant: 'destructive',
        })
      })
  })
  loginLoad.value = false
}

async function registerFacebook(): Promise<void> {
  loginLoad.value = true
  const provider = new FacebookAuthProvider()
  await signInWithPopup(auth, provider)
    .then(async (result) => {
      user_auth.setUser(result.user)
      await createNewUserProfile({
        displayName: result.user.displayName,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      })
      router.replace({ name: 'home' })
    })
    .catch((error) => {
      toast({
        title: 'Registration error',
        description: error,
        variant: 'destructive',
      })
    })
  loginLoad.value = false
}
</script>

<template>
  <Toaster />
  <main
    class="mx-auto flex w-[calc(100svw-calc(var(--gutter)*2))] max-w-screen-xl flex-col gap-y-8 py-[var(--gutter)] [--gutter:1rem] lg:[--gutter:2rem]"
    :class="{ 'cursor-not-allowed': loginLoad }"
  >
    <img class="h-12 w-auto self-start" src="@/assets/logo.png" alt="marketingmaster.io logo" />
    <template v-if="!isSignInCredentialsFormVisible">
      <section class="flex flex-col gap-y-2 text-center">
        <h1 class="text-4xl/none font-bold">Sign in to MMIO</h1>
        <p class="text-sm">
          New to MMIO?
          <Button variant="link" as-child class="h-[unset] p-0 text-blue-500">
            <RouterLink to="/register">Create an account</RouterLink>
          </Button>
        </p>
      </section>
      <section
        v-if="!loginLoad"
        class="flex w-[calc(100svw-2rem)] max-w-xs flex-col gap-y-2 self-center"
      >
        <Button variant="secondary" class="relative" @click="toggleSignInCredentialsForm">
          <Icon icon="ic:baseline-email" class="absolute left-4 top-1/2 size-5 -translate-y-1/2" />
          Email
        </Button>
        <Button variant="secondary" class="relative">
          <Icon icon="bi:google" class="absolute left-4 top-1/2 size-5 -translate-y-1/2" />
          Sign in with Google
        </Button>
        <Button variant="secondary" class="relative" @click="registerFacebook">
          <Icon icon="bi:facebook" class="absolute left-4 top-1/2 size-5 -translate-y-1/2" />
          Sign in with Facebook
        </Button>
      </section>

      <section v-else class="flex w-[calc(100svw-2rem)] max-w-xs flex-col gap-y-2 self-center">
        <Button variant="outline" size="xs" disabled class="flex items-center gap-2">
          <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
        </Button>
      </section>
    </template>
    <template v-else>
      <section class="flex flex-col gap-y-2 text-center">
        <h1 class="text-4xl/none font-bold">Login with your Email</h1>
        <p class="text-sm">
          You can also use
          <Button
            variant="link"
            class="h-[unset] p-0 text-blue-500"
            @click="toggleSignInCredentialsForm"
          >
            Facebook or Google
          </Button>
          to login
        </p>
      </section>
      <form
        class="flex w-[calc(100svw-2rem)] max-w-lg flex-col gap-y-4 self-center"
        @submit.prevent="handleLoginUser"
      >
        <div class="flex flex-col gap-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="johndoe@gmail.com"
            autocomplete="email"
            required
            v-model="form.email"
            :disabled="loginLoad"
          />
        </div>
        <div class="grid grid-cols-2 gap-y-1">
          <Label for="password">Password</Label>
          <Button variant="link" as-child class="h-[unset] justify-self-end p-0 text-blue-500">
            <RouterLink to="/forgot-password">Forgot your password?</RouterLink>
          </Button>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            autocomplete="password"
            class="col-span-2"
            required
            v-model="form.password"
            :disabled="loginLoad"
          />
        </div>
        <Button v-if="!loginLoad" type="submit">Sign in</Button>
        <Button v-else variant="outline" size="xs" disabled class="flex items-center gap-2">
          <i class="material-icons animate-spin text-sm">donut_large</i>Loading....
        </Button>
      </form>
    </template>
  </main>
</template>
